import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getBillingPlan } from "@/lib/billing";
import {
  createCreemClient,
  getAppUrl,
  getCreemProductId,
} from "@/lib/billing-server";

type CheckoutBody = {
  plan_key?: string;
  billing_cycle?: "monthly" | "annual" | "one_time";
};

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let orderId: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CheckoutBody;
    const billingCycle = body.billing_cycle;
    if (!body.plan_key || !billingCycle) {
      return NextResponse.json(
        { error: "Missing plan_key or billing_cycle" },
        { status: 400 },
      );
    }

    const plan = getBillingPlan(body.plan_key, billingCycle);
    if (!plan) {
      return NextResponse.json({ error: "Invalid billing plan" }, { status: 400 });
    }

    const productId = getCreemProductId(plan.key, plan.cycle);
    if (!productId) {
      return NextResponse.json(
        { error: "This billing plan is not configured yet" },
        { status: 503 },
      );
    }

    const apiKey = process.env.CREEM_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Creem payment is not configured" },
        { status: 503 },
      );
    }

    const admin = createAdminClient();
    const requestId = `aividox_${user.id}_${crypto.randomUUID()}`;
    const { data: pendingOrder, error: orderError } = await admin
      .from("billing_orders")
      .insert({
        user_id: user.id,
        request_id: requestId,
        creem_product_id: productId,
        plan_key: plan.key,
        billing_cycle: plan.cycle,
        credits_amount: plan.credits,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderError || !pendingOrder) {
      console.error("Billing order creation error:", orderError);
      return NextResponse.json(
        { error: "Unable to create billing order" },
        { status: 503 },
      );
    }
    orderId = pendingOrder.id;

    const successUrl = new URL(`${getAppUrl()}/payment/success`);
    successUrl.searchParams.set("request_id", requestId);
    successUrl.searchParams.set("order_id", pendingOrder.id);
    const checkout = await createCreemClient().checkouts.create({
      productId,
      requestId,
      customer: user.email ? { email: user.email } : undefined,
      successUrl: successUrl.toString(),
      metadata: {
        userId: user.id,
        planKey: plan.key,
        billingCycle: plan.cycle,
        credits: String(plan.credits),
        requestId,
      },
    });

    if (!checkout.checkoutUrl) throw new Error("Creem did not return a checkout URL");

    await admin
      .from("billing_orders")
      .update({
        checkout_id: checkout.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return NextResponse.json({ checkout_url: checkout.checkoutUrl, order_id: pendingOrder.id });
  } catch (error) {
    if (orderId) {
      try {
        const admin = createAdminClient();
        await admin
          .from("billing_orders")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", orderId);
      } catch (updateError) {
        console.error("Failed to mark billing order:", updateError);
      }
    }

    console.error("Checkout API error:", error);
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 },
    );
  }
}
