import { NextRequest, NextResponse } from "next/server";
import { createCreemClient, getAppUrl } from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const planCode = typeof body.plan_id === "string" ? body.plan_id : "";
    if (!planCode || planCode === "free") {
      return NextResponse.json({ error: "This plan does not require payment" }, { status: 400 });
    }

    const { data: plan, error: planError } = await supabase
      .from("billing_plans")
      .select("id, code, name, provider_product_id, price_cents, currency, credits")
      .eq("code", planCode)
      .eq("is_active", true)
      .single();

    if (planError || !plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    if (!plan.provider_product_id) {
      return NextResponse.json({ error: "This plan is not configured for payment yet" }, { status: 409 });
    }

    const { data: order, error: orderError } = await supabase
      .from("billing_orders")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        amount_cents: plan.price_cents,
        currency: plan.currency,
        credits: plan.credits,
      })
      .select("id")
      .single();

    if (orderError || !order) throw orderError ?? new Error("Order was not created");

    try {
      const checkout = await createCreemClient().checkouts.create({
        productId: plan.provider_product_id,
        requestId: `order_${order.id}`,
        customer: user.email ? { email: user.email } : undefined,
        successUrl: `${getAppUrl(request.nextUrl.origin)}/account?payment=success`,
        metadata: { orderId: order.id, userId: user.id, planCode: plan.code },
      });

      if (!checkout.checkoutUrl) throw new Error("Creem did not return a checkout URL");
      await supabase
        .from("billing_orders")
        .update({ provider_checkout_id: checkout.id, updated_at: new Date().toISOString() })
        .eq("id", order.id);

      return NextResponse.json({ checkout_url: checkout.checkoutUrl, order_id: order.id });
    } catch (error) {
      await supabase.from("billing_orders").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", order.id);
      throw error;
    }
  } catch (error) {
    console.error("Billing checkout API error:", error);
    return NextResponse.json({ error: "Unable to create checkout" }, { status: 502 });
  }
}
