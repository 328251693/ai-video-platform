import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type WebhookTask = {
  credits_used: number | null;
  profiles: {
    id: string;
    credits_remaining: number | null;
  } | null;
};

// Webhook handler for upstream AI providers
// POST /api/webhook

// For dynamic route: /api/webhook/[provider]
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (in production, implement proper verification)
    const signature = request.headers.get("x-webhook-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Parse webhook payload
    const body = await request.json();
    const { task_id, status, output_url, error_message } = body;

    if (!task_id) {
      return NextResponse.json({ error: "Missing task_id" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get task
    const { data: task, error: taskError } = await supabase
      .from("generation_tasks")
      .select("*, profiles!inner(id, credits_remaining)")
      .eq("id", task_id)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const taskData = task as WebhookTask;
    const profiles = taskData.profiles;

    // Update task based on webhook status
    if (status === "completed") {
      await supabase
        .from("generation_tasks")
        .update({
          status: "completed",
          output_url,
          output_thumbnail: body.output_thumbnail,
          metadata: body.metadata || {},
          completed_at: new Date().toISOString(),
        })
        .eq("id", task_id);
    } else if (status === "failed") {
      await supabase
        .from("generation_tasks")
        .update({
          status: "failed",
          error_message,
          completed_at: new Date().toISOString(),
        })
        .eq("id", task_id);

      // Refund credits on failure
      if (profiles && typeof profiles.credits_remaining === "number") {
        const refundAmount = taskData.credits_used || 0;
        const newBalance = profiles.credits_remaining + refundAmount;

        await supabase
          .from("profiles")
          .update({ credits_remaining: newBalance })
          .eq("id", profiles.id);

        // Record refund
        await supabase.from("credit_transactions").insert({
          user_id: profiles.id,
          amount: refundAmount,
          balance_after: newBalance,
          source: "refund",
          reference_id: task_id,
        });
      }
    } else if (status === "processing") {
      await supabase
        .from("generation_tasks")
        .update({
          status: "processing",
          started_at: new Date().toISOString(),
        })
        .eq("id", task_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
