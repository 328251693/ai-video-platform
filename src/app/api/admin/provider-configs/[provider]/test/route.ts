import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { testProviderConnection } from "@/lib/providers";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const { provider } = await params;
    const result = await testProviderConnection(provider);
    return NextResponse.json(result, { status: result.status === "passed" ? 200 : 502 });
  } catch (error) {
    console.error("Provider connection test error:", error);
    return NextResponse.json({ status: "failed", message: "Provider connection test failed" }, { status: 502 });
  }
}
