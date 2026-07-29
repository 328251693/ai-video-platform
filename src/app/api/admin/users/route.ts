import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getAdminUsers } from "@/lib/admin-data";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    return NextResponse.json({ users: await getAdminUsers() });
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json({ error: "Failed to load admin users" }, { status: 500 });
  }
}
