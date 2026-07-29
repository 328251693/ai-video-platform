import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getAdminTaskStats } from "@/lib/admin-data";

export async function GET() {
  const { response } = await requireAdminApi();
  if (response) return response;

  try {
    return NextResponse.json(await getAdminTaskStats());
  } catch (error) {
    console.error("Admin task stats API error:", error);
    return NextResponse.json({ error: "Failed to load task stats" }, { status: 500 });
  }
}
