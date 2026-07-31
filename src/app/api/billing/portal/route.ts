import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCreemBaseUrl } from "@/lib/billing-server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("creem_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile?.creem_customer_id) {
      return NextResponse.json(
        { error: "No Creem customer record is available yet" },
        { status: 404 },
      );
    }

    const apiKey = process.env.CREEM_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "Creem payment is not configured" }, { status: 503 });
    }

    const response = await fetch(`${getCreemBaseUrl()}/v1/customers/billing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ customer_id: profile.creem_customer_id }),
    });
    const body = (await response.json().catch(() => null)) as
      | { customer_portal_link?: string }
      | null;

    if (!response.ok || !body?.customer_portal_link) {
      console.error("Creem customer portal error:", response.status, body);
      return NextResponse.json({ error: "Unable to open billing portal" }, { status: 502 });
    }

    return NextResponse.json({ customer_portal_link: body.customer_portal_link });
  } catch (error) {
    console.error("Billing portal API error:", error);
    return NextResponse.json({ error: "Unable to open billing portal" }, { status: 500 });
  }
}
