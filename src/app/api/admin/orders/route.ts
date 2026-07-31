import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getAdminBillingOrders } from "@/lib/admin-data";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    return NextResponse.json({ orders: await getAdminBillingOrders() });
  } catch (error) {
    console.error("Admin orders API error:", error);
    return NextResponse.json({ error: "Failed to load billing orders" }, { status: 500 });
  }
}
