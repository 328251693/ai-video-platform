import { Webhook } from "@creem_io/nextjs";
import { processBillingEvent } from "@/lib/creem-webhook";

export const runtime = "nodejs";

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET ?? "",
  onCheckoutCompleted: (event) => processBillingEvent("checkout.completed", event),
  onRefundCreated: (event) => processBillingEvent("refund.created", event),
  onDisputeCreated: (event) => processBillingEvent("dispute.created", event),
  onSubscriptionActive: (event) => processBillingEvent("subscription.active", event),
  onSubscriptionTrialing: (event) => processBillingEvent("subscription.trialing", event),
  onSubscriptionCanceled: (event) => processBillingEvent("subscription.canceled", event),
  onSubscriptionPaid: (event) => processBillingEvent("subscription.paid", event),
  onSubscriptionExpired: (event) => processBillingEvent("subscription.expired", event),
  onSubscriptionUnpaid: (event) => processBillingEvent("subscription.unpaid", event),
  onSubscriptionUpdate: (event) => processBillingEvent("subscription.update", event),
  onSubscriptionPastDue: (event) => processBillingEvent("subscription.past_due", event),
  onSubscriptionPaused: (event) => processBillingEvent("subscription.paused", event),
  onSubscriptionScheduledCancel: (event) => processBillingEvent("subscription.scheduled_cancel", event),
});
