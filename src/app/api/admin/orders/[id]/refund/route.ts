import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

type RefundBody = {
  amount?: number;
  credits_to_revoke?: number;
  reason?: string;
  status?: "completed" | "rejected";
  provider_refund_id?: string;
  external_reference?: string;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(["owner", "admin"]);
  if (auth.response) return auth.response;

  try {
    const { id: orderId } = await params;
    const body = await request.json() as RefundBody;
    const reason = body.reason?.trim();
    if (!reason) return NextResponse.json({ error: "Refund reason is required" }, { status: 400 });

    const admin = createAdminClient();
    const { data: order, error: orderError } = await admin
      .from("billing_orders")
      .select("id, user_id, amount, currency, credits_amount, status")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status !== "completed") {
      return NextResponse.json({ error: "Only completed orders can be refunded" }, { status: 409 });
    }

    const amount = body.amount === undefined ? order.amount : body.amount;
    const creditsToRevoke = body.credits_to_revoke ?? order.credits_amount;
    if (amount !== null && (!Number.isInteger(amount) || amount <= 0)) {
      return NextResponse.json({ error: "Refund amount must be a positive integer" }, { status: 400 });
    }
    if (!Number.isInteger(creditsToRevoke) || creditsToRevoke <= 0 || creditsToRevoke > order.credits_amount) {
      return NextResponse.json({ error: "Invalid Credits refund amount" }, { status: 400 });
    }

    const { data: activeRefund } = await admin
      .from("billing_refunds")
      .select("id, status")
      .eq("order_id", orderId)
      .in("status", ["requested", "manual_pending", "completed"])
      .maybeSingle();
    if (activeRefund) {
      return NextResponse.json({ error: "This order already has an active refund", refund: activeRefund }, { status: 409 });
    }

    const { data: refund, error: refundError } = await admin
      .from("billing_refunds")
      .insert({
        order_id: order.id,
        user_id: order.user_id,
        amount,
        currency: order.currency,
        credits_to_revoke: creditsToRevoke,
        status: "manual_pending",
        reason,
        requested_by: auth.context.user.id,
      })
      .select("*")
      .single();
    if (refundError) throw refundError;

    await admin.from("billing_orders").update({ status: "refund_requested", updated_at: new Date().toISOString() }).eq("id", orderId);
    await admin.from("admin_audit_logs").insert({
      actor_id: auth.context.user.id,
      action: "billing_refund.requested",
      target_type: "billing_order",
      target_id: orderId,
      after_data: { refund_id: refund.id, amount, credits_to_revoke: creditsToRevoke, status: "manual_pending" },
      reason,
    });

    return NextResponse.json({ refund }, { status: 201 });
  } catch (error) {
    console.error("Admin refund request error:", error);
    return NextResponse.json({ error: "Failed to create refund request" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(["owner", "admin"]);
  if (auth.response) return auth.response;

  try {
    const { id: refundId } = await params;
    const body = await request.json() as RefundBody;
    if (body.status !== "completed" && body.status !== "rejected") {
      return NextResponse.json({ error: "Refund status must be completed or rejected" }, { status: 400 });
    }

    const admin = createAdminClient();
    if (body.status === "completed") {
      const { data, error } = await admin.rpc("admin_complete_billing_refund", {
        p_refund_id: refundId,
        p_admin_id: auth.context.user.id,
        p_provider_refund_id: body.provider_refund_id?.trim() || null,
        p_external_reference: body.external_reference?.trim() || null,
      });
      if (error) throw error;
      return NextResponse.json({ result: data });
    }

    const { data: refund, error: refundError } = await admin
      .from("billing_refunds")
      .update({ status: "rejected", approved_by: auth.context.user.id, updated_at: new Date().toISOString() })
      .eq("id", refundId)
      .in("status", ["requested", "manual_pending"])
      .select("*")
      .maybeSingle();
    if (refundError) throw refundError;
    if (!refund) return NextResponse.json({ error: "Refund not found or already processed" }, { status: 409 });

    await admin.from("billing_orders").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", refund.order_id);
    await admin.from("admin_audit_logs").insert({
      actor_id: auth.context.user.id,
      action: "billing_refund.rejected",
      target_type: "billing_refund",
      target_id: refundId,
      after_data: { status: "rejected" },
      reason: body.reason?.trim() || "后台拒绝退款",
    });

    return NextResponse.json({ refund });
  } catch (error) {
    console.error("Admin refund update error:", error);
    return NextResponse.json({ error: "Failed to update refund" }, { status: 500 });
  }
}
