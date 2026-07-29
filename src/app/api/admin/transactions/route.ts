import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getAdminTransactions } from "@/lib/admin-data";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    return NextResponse.json({ transactions: await getAdminTransactions() });
  } catch (error) {
    console.error("Admin transactions API error:", error);
    return NextResponse.json({ error: "Failed to load admin transactions" }, { status: 500 });
  }
}
