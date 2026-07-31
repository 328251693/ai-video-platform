import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getAdminPaymentEvents } from "@/lib/admin-data";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    return NextResponse.json({ events: await getAdminPaymentEvents() });
  } catch (error) {
    console.error("Admin payment events API error:", error);
    return NextResponse.json({ error: "Failed to load payment events" }, { status: 500 });
  }
}
