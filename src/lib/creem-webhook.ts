import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  getBillingPlanByProductId,
  getBillingPlanFromMetadata,
} from "@/lib/billing-server";

type JsonRecord = Record<string, unknown>;

export type CommerceEvent = {
  id: string;
  webhookId: string;
  webhookEventType: string;
  metadata?: unknown;
  product?: unknown;
  customer?: unknown;
  order?: unknown;
  checkout?: unknown;
  subscription?: unknown;
  status?: string;
};

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function getId(value: unknown): string | null {
  if (typeof value === "string" && value) return value;
  const record = asRecord(value);
  return typeof record?.id === "string" && record.id ? record.id : null;
}

function getString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value) return value;
  }
  return null;
}

function getNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function eventMetadata(event: CommerceEvent) {
  return asRecord(event.metadata) ?? {};
}

async function findOrder(
  admin: ReturnType<typeof createAdminClient>,
  requestId: string | null,
  checkoutId: string | null,
  creemOrderId: string | null,
) {
  if (requestId) {
    const { data } = await admin.from("billing_orders").select("*").eq("request_id", requestId).maybeSingle();
    if (data) return data;
  }
  if (checkoutId) {
    const { data } = await admin.from("billing_orders").select("*").eq("checkout_id", checkoutId).maybeSingle();
    if (data) return data;
  }
  if (creemOrderId) {
    const { data } = await admin.from("billing_orders").select("*").eq("creem_order_id", creemOrderId).maybeSingle();
    if (data) return data;
  }
  return null;
}

export async function processBillingEvent(eventType: string, event: CommerceEvent) {
  const admin = createAdminClient();
  const eventId = `${eventType}:${event.webhookId}`;
  const { data: existingEvent } = await admin
    .from("billing_webhook_events")
    .select("status")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existingEvent?.status === "processed") return;

  if (!existingEvent) {
    const { error } = await admin.from("billing_webhook_events").insert({
      event_id: eventId,
      event_type: eventType,
      payload: serializeEvent(event),
      status: "received",
    });
    if (error && error.code !== "23505") throw error;
  }

  try {
    const metadata = eventMetadata(event);
    const rawEvent = asRecord(event) ?? {};
    const requestId = getString(metadata.requestId, metadata.request_id, rawEvent.request_id);
    const checkoutId = eventType === "checkout.completed" ? event.id : getId(rawEvent.checkout);
    const creemOrderId = getId(event.order);
    const subscriptionId = getId(event.subscription) || (eventType.startsWith("subscription.") ? event.id : null);
    const productId = getId(event.product);
    const customerId = getId(event.customer);
    const existingOrder = await findOrder(admin, requestId, checkoutId, creemOrderId);
    const productPlan = getBillingPlanByProductId(productId);
    const metadataPlan = getBillingPlanFromMetadata(metadata.planKey, metadata.billingCycle);
    const existingPlan = existingOrder
      ? getBillingPlanFromMetadata(existingOrder.plan_key, existingOrder.billing_cycle)
      : null;
    const plan = productPlan || metadataPlan || existingPlan;
    const userId = getString(metadata.userId, metadata.user_id) || existingOrder?.user_id || null;
    const resolvedRequestId = requestId || existingOrder?.request_id || eventId;
    const creditsAmount = plan?.credits || existingOrder?.credits_amount || 0;
    const shouldGrantCredits =
      (eventType === "checkout.completed" && plan?.cycle === "one_time") ||
      eventType === "subscription.paid";
    const shouldReverseCredits = eventType === "refund.created" || eventType === "dispute.created";

    if ((shouldGrantCredits || shouldReverseCredits) && (!userId || !plan || creditsAmount <= 0)) {
      throw new Error("Creem webhook is missing user or product metadata");
    }

    const orderValues = {
      user_id: userId,
      request_id: resolvedRequestId,
      checkout_id: checkoutId,
      creem_order_id: creemOrderId,
      creem_product_id: productId || existingOrder?.creem_product_id || "unknown",
      plan_key: plan?.key || existingOrder?.plan_key || "basic",
      billing_cycle: plan?.cycle || existingOrder?.billing_cycle || "one_time",
      credits_amount: creditsAmount,
      amount: getNumber(asRecord(event.order)?.amount, asRecord(event.order)?.amount_due, rawEvent.amount),
      currency: getString(asRecord(event.order)?.currency),
      status: shouldReverseCredits
        ? eventType === "refund.created" ? "refunded" : "disputed"
        : shouldGrantCredits ? "completed" : existingOrder?.status || "pending",
      paid_at: shouldGrantCredits ? new Date().toISOString() : existingOrder?.paid_at,
      updated_at: new Date().toISOString(),
    };

    if (existingOrder) {
      const { error } = await admin.from("billing_orders").update(orderValues).eq("id", existingOrder.id);
      if (error) throw error;
    } else if (userId) {
      const { error } = await admin.from("billing_orders").insert(orderValues);
      if (error && error.code !== "23505") throw error;
    }

    const creditReference = creemOrderId || checkoutId || resolvedRequestId || eventId;
    if (shouldGrantCredits) {
      const { error } = await admin.rpc("grant_purchase_credits", {
        p_user_id: userId,
        p_amount: creditsAmount,
        p_reference_id: creditReference,
      });
      if (error) throw error;
    }
    if (shouldReverseCredits) {
      const { error } = await admin.rpc("revoke_purchase_credits", {
        p_user_id: userId,
        p_amount: creditsAmount,
        p_reference_id: creditReference,
      });
      if (error) throw error;
    }

    const subscriptionStatus = getString(event.status);
    if (subscriptionId && userId && plan) {
      const { error } = await admin.from("billing_subscriptions").upsert(
        {
          user_id: userId,
          creem_subscription_id: subscriptionId,
          creem_product_id: productId || existingOrder?.creem_product_id || "unknown",
          plan_key: plan.key,
          billing_cycle: plan.cycle,
          status: subscriptionStatus || eventType.replace("subscription.", ""),
          credits_per_period: creditsAmount,
          current_period_end: getString(rawEvent.current_period_end_date, rawEvent.current_end_period),
          cancel_at_period_end: eventType === "subscription.scheduled_cancel",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "creem_subscription_id" },
      );
      if (error) throw error;

      if (["subscription.active", "subscription.paid", "subscription.trialing"].includes(eventType)) {
        const { error: profileError } = await admin
          .from("profiles")
          .update({ plan: plan.key, updated_at: new Date().toISOString() })
          .eq("id", userId);
        if (profileError) throw profileError;
      }
    }

    if (userId && customerId) {
      const { error } = await admin
        .from("profiles")
        .update({ creem_customer_id: customerId, updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (error) throw error;
    }

    const { error: eventError } = await admin
      .from("billing_webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString(), error_message: null })
      .eq("event_id", eventId);
    if (eventError) throw eventError;
  } catch (error) {
    await admin
      .from("billing_webhook_events")
      .update({ status: "failed", error_message: String(error) })
      .eq("event_id", eventId);
    throw error;
  }
}

export function deserializeCommerceEvent(payload: unknown) {
  const event = asRecord(payload);
  if (!event || typeof event.id !== "string" || typeof event.webhookId !== "string") {
    throw new Error("Stored Creem event payload is invalid");
  }
  return event as unknown as CommerceEvent;
}

function serializeEvent(event: CommerceEvent) {
  return JSON.parse(JSON.stringify(event)) as JsonRecord;
}
