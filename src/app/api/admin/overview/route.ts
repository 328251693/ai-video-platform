import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getAdminOverview } from "@/lib/admin-data";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    return NextResponse.json({ overview: await getAdminOverview() });
  } catch (error) {
    console.error("Admin overview API error:", error);
    return NextResponse.json({ error: "Failed to load admin overview" }, { status: 500 });
  }
}
