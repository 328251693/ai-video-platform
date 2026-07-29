import { Webhook } from "@creem_io/nextjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrderIdFromMetadata, getProviderId } from "@/lib/billing";

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET ?? "",
  onCheckoutCompleted: async (event) => {
    const orderId = getOrderIdFromMetadata(event.metadata);
    if (!orderId) throw new Error("Creem checkout is missing orderId metadata");

    const providerOrderId = getProviderId(event.order);
    const providerCheckoutId = event.id;
    const adminClient = createAdminClient();
    const { error } = await adminClient.rpc("complete_billing_order", {
      p_provider: "creem",
      p_event_id: event.webhookId,
      p_order_id: orderId,
      p_provider_order_id: providerOrderId,
      p_provider_checkout_id: providerCheckoutId,
      p_event_type: event.webhookEventType,
      p_payload: {
        webhook_id: event.webhookId,
        checkout_id: event.id,
        order_id: providerOrderId,
        product_id: getProviderId(event.product),
        metadata: event.metadata ?? {},
      },
    });

    if (error) throw error;
  },
  onRefundCreated: async (event) => {
    const adminClient = createAdminClient();
    const providerOrderId = getProviderId(event.order);
    const { error } = await adminClient.from("payment_events").insert({
      provider: "creem",
      event_id: event.webhookId,
      event_type: event.webhookEventType,
      payload: {
        webhook_id: event.webhookId,
        refund_id: event.id,
        order_id: providerOrderId,
        status: event.status,
      },
    });

    if (error && error.code !== "23505") throw error;
  },
});
