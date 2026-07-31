import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { deserializeCommerceEvent, processBillingEvent } from "@/lib/creem-webhook";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(["owner", "admin"]);
  if (auth.response) return auth.response;

  try {
    const { id: eventId } = await params;
    const admin = createAdminClient();
    const { data: eventRow, error } = await admin
      .from("billing_webhook_events")
      .select("event_id, event_type, payload, status")
      .eq("event_id", eventId)
      .maybeSingle();

    if (error) throw error;
    if (!eventRow) return NextResponse.json({ error: "Payment event not found" }, { status: 404 });
    if (eventRow.status === "processed") return NextResponse.json({ success: true, already_processed: true });

    await processBillingEvent(eventRow.event_type, deserializeCommerceEvent(eventRow.payload));
    await admin.from("admin_audit_logs").insert({
      actor_id: auth.context.user.id,
      action: "billing_webhook.retry",
      target_type: "billing_webhook_event",
      target_id: eventId,
      after_data: { status: "processed" },
      reason: "后台重试支付 Webhook",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin payment event retry error:", error);
    return NextResponse.json({ error: "Payment event retry failed" }, { status: 500 });
  }
}
