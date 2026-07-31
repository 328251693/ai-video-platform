import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getAdminTasks } from "@/lib/admin-data";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    return NextResponse.json({ tasks: await getAdminTasks() });
  } catch (error) {
    console.error("Admin tasks API error:", error);
    return NextResponse.json({ error: "Failed to load admin tasks" }, { status: 500 });
  }
}
