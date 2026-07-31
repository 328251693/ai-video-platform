import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getAdminAuditLogs } from "@/lib/admin-data";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  try {
    return NextResponse.json({ logs: await getAdminAuditLogs() });
  } catch (error) {
    console.error("Admin audit logs API error:", error);
    return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 });
  }
}
