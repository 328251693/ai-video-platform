import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const { id } = await params;
  const adminClient = createAdminClient();
  const { data: task, error: taskError } = await adminClient
    .from("generation_tasks")
    .select("id, status, credits_used")
    .eq("id", id)
    .maybeSingle();

  if (taskError) {
    return NextResponse.json({ error: "Failed to load task" }, { status: 500 });
  }
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const { data: refunds, error: refundError } = await adminClient
    .from("credit_transactions")
    .select("id, amount, created_at")
    .eq("source", "refund")
    .eq("reference_id", id)
    .order("created_at", { ascending: false });

  if (refundError) {
    return NextResponse.json({ error: "Failed to check refunds" }, { status: 500 });
  }

  const refund = refunds?.[0] ?? null;
  const creditsUsed = Number(task.credits_used ?? 0);
  return NextResponse.json({
    task_id: task.id,
    eligible: task.status === "failed" && creditsUsed > 0 && !refund,
    already_refunded: Boolean(refund),
    credits_used: creditsUsed,
    refund_transaction_id: refund?.id ?? null,
  });
}
