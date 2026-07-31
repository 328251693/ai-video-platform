import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeModelProvider } from "@/lib/models";
import { isSupportedProvider, submitGeneration } from "@/lib/providers";

type InputParams = Record<string, unknown>;
type RetryReservation = { retry_count?: number; credits_remaining?: number };

export const runtime = "nodejs";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(["owner", "admin"]);
  if (auth.response) return auth.response;

  const { id: taskId } = await params;
  const admin = createAdminClient();
  let reservation: RetryReservation | undefined;
  let task: Record<string, unknown> | null = null;
  let providerSubmitted = false;

  try {
    const { data: taskRow, error: taskError } = await admin
      .from("generation_tasks")
      .select("*")
      .eq("id", taskId)
      .maybeSingle();
    if (taskError) throw taskError;
    if (!taskRow) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    task = taskRow as Record<string, unknown>;

    const { data: model, error: modelError } = await admin
      .from("models")
      .select("*")
      .eq("id", taskRow.model_id)
      .maybeSingle();
    if (modelError) throw modelError;
    if (!model) return NextResponse.json({ error: "Task model not found" }, { status: 404 });

    const { data: retryResult, error: retryError } = await admin.rpc("admin_retry_generation_task", {
      p_task_id: taskId,
      p_admin_id: auth.context.user.id,
      p_max_retries: 2,
    });
    if (retryError) {
      return NextResponse.json({ error: retryError.message }, { status: 409 });
    }
    reservation = (retryResult ?? {}) as RetryReservation;

    const provider = normalizeModelProvider(String(model.provider ?? ""));
    if (!provider || !isSupportedProvider(provider)) {
      throw new Error("Task model provider is not configured");
    }

    const inputParams = (taskRow.input_params ?? {}) as InputParams;
    const type = model.type === "image" ? "image" : "video";
    const providerResult = await submitGeneration({
      prompt: String(taskRow.prompt ?? ""),
      model: String(taskRow.model_id),
      provider,
      provider_model_id: typeof model.provider_model_id === "string" ? model.provider_model_id : null,
      duration: typeof inputParams.duration === "number" ? inputParams.duration : undefined,
      aspect_ratio: typeof inputParams.aspect_ratio === "string" ? inputParams.aspect_ratio : undefined,
      image_url: typeof inputParams.image_url === "string" ? inputParams.image_url : undefined,
      type,
      resolution: typeof inputParams.resolution === "string" ? inputParams.resolution : undefined,
    });
    providerSubmitted = true;

    const metadata = {
      ...((taskRow.metadata ?? {}) as Record<string, unknown>),
      provider,
      type,
      provider_task_id: providerResult.provider_task_id,
    };
    const isCompleted = providerResult.status === "succeeded" && Boolean(providerResult.output_url);
    const { data: updatedTask, error: updateError } = await admin
      .from("generation_tasks")
      .update({
        status: isCompleted ? "completed" : "processing",
        metadata,
        output_url: isCompleted ? providerResult.output_url : null,
        started_at: new Date().toISOString(),
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq("id", taskId)
      .select("*")
      .single();
    if (updateError) throw updateError;

    return NextResponse.json({ task: updatedTask, credits_remaining: reservation?.credits_remaining });
  } catch (error) {
    console.error("Admin task retry error:", error);

    if (reservation && task && !providerSubmitted) {
      const retryCount = Number(reservation.retry_count ?? 0);
      await admin
        .from("generation_tasks")
        .update({ status: "failed", error_message: String(error), completed_at: new Date().toISOString() })
        .eq("id", taskId);
      const refundReference = `${taskId}:retry-refund:${retryCount}`;
      await admin.rpc("admin_refund_generation_credits", {
        p_task_id: taskId,
        p_admin_id: auth.context.user.id,
        p_amount: Number(task.credits_used ?? 0),
        p_reference_id: refundReference,
      });
    }

    return NextResponse.json({ error: "Generation retry failed and Credits were refunded" }, { status: 502 });
  }
}
