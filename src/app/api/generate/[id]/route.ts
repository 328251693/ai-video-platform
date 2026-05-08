import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkGenerationStatus } from "@/lib/providers";
import { uploadUrlToR2, isR2Configured } from "@/lib/r2";

// GET /api/generate/[id] - Check task status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const supabase = await createClient();

    // Get authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get task
    const { data: task, error: taskError } = await supabase
      .from("generation_tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify ownership
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile || task.user_id !== profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If task is still processing, check upstream status
    if (task.status === "processing") {
      try {
        // Get provider and provider_task_id from metadata
        const metadata = (task as any).metadata || {};
        const provider = metadata.provider || "grsai";
        const providerTaskId = metadata.provider_task_id || task.id;

        console.log("[Status] Checking status:", { provider, providerTaskId });

        const status = await checkGenerationStatus(provider, providerTaskId);

        // Update if changed
        if (status.status !== task.status) {
          let finalUrl = status.output_url;

          // 任务完成时，把视频上传到 R2 持久存储
          if (status.status === "completed" && status.output_url && isR2Configured()) {
            try {
              const ext = task.model_id === "gpt-image-2" ? "png" : "mp4";
              const key = `videos/${task.user_id}/${task.id}.${ext}`;
              console.log("[R2] Uploading to R2:", key);
              finalUrl = await uploadUrlToR2(status.output_url, key);
              console.log("[R2] Uploaded successfully:", finalUrl);
            } catch (r2Err) {
              console.error("[R2] Upload failed, using original URL:", r2Err);
              finalUrl = status.output_url;
            }
          }

          await supabase
            .from("generation_tasks")
            .update({
              status: status.status,
              output_url: finalUrl,
              error_message: status.error,
              completed_at: status.status === "completed" ? new Date().toISOString() : null,
            })
            .eq("id", taskId);

          return NextResponse.json({
            task: {
              ...task,
              status: status.status,
              output_url: finalUrl,
              error_message: status.error,
            },
          });
        }
      } catch (err) {
        console.error("Status check error:", err);
        // Continue with cached status
      }
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Generate status API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/generate/[id] - Cancel/Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, credits_remaining")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get task
    const { data: task } = await supabase
      .from("generation_tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (!task || task.user_id !== profile.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Only refund if pending or processing
    if (task.status === "pending" || task.status === "processing") {
      const refundAmount = task.credits_used || 0;
      const newBalance = profile.credits_remaining + refundAmount;

      await supabase
        .from("profiles")
        .update({ credits_remaining: newBalance })
        .eq("id", profile.id);

      await supabase.from("credit_transactions").insert({
        user_id: profile.id,
        amount: refundAmount,
        balance_after: newBalance,
        source: "refund",
        reference_id: taskId,
      });
    }

    // Delete task
    await supabase
      .from("generation_tasks")
      .delete()
      .eq("id", taskId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Generate delete API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}