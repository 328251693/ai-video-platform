import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_RETRIES = 2;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  const { id } = await params;
  const adminClient = createAdminClient();
  const { data: task, error } = await adminClient
    .from("generation_tasks")
    .select("id, status, metadata, credits_used")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Failed to load task" }, { status: 500 });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const metadata = isRecord(task.metadata) ? task.metadata : {};
  const retryCount = typeof metadata.retry_count === "number" ? metadata.retry_count : 0;
  const eligible = task.status === "failed" && retryCount < MAX_RETRIES && Number(task.credits_used ?? 0) > 0;

  return NextResponse.json({
    task_id: task.id,
    eligible,
    retry_count: retryCount,
    max_retries: MAX_RETRIES,
    reason: task.status !== "failed" ? "task_not_failed" : retryCount >= MAX_RETRIES ? "retry_limit_reached" : eligible ? null : "no_credits_reserved",
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
