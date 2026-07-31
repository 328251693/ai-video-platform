import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getAdminOrders } from "@/lib/admin-data";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    return NextResponse.json({ orders: await getAdminOrders() });
  } catch (error) {
    console.error("Admin orders API error:", error);
    return NextResponse.json({ error: "Failed to load admin orders" }, { status: 500 });
  }
}
