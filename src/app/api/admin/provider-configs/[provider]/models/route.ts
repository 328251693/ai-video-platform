import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { listProviderModels } from "@/lib/providers";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const { provider } = await params;
    const models = await listProviderModels(provider);
    return NextResponse.json({ provider, models });
  } catch (error) {
    console.error("Provider model catalog error:", error);
    const message = error instanceof Error ? error.message : "Failed to load provider models";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
