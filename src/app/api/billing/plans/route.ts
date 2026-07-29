import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("billing_plans")
      .select("id, code, name, description, price_cents, currency, credits, provider_product_id, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ plans: data ?? [] });
  } catch (error) {
    console.error("Billing plans API error:", error);
    return NextResponse.json({ error: "Billing plans are not configured" }, { status: 503 });
  }
}
