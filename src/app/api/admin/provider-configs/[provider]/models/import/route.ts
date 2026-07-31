import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { importProviderModels } from "@/lib/providers";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const auth = await requireAdminApi(["owner", "admin"]);
  if (auth.response) return auth.response;

  try {
    const { provider } = await params;
    const body = await request.json() as { provider_model_ids?: unknown[] };
    const selectedIds = Array.isArray(body.provider_model_ids)
      ? body.provider_model_ids.filter((value): value is string => typeof value === "string")
      : [];
    const imported = await importProviderModels(provider, selectedIds);
    return NextResponse.json({ models: imported, count: imported.length });
  } catch (error) {
    console.error("Provider model import error:", error);
    const message = error instanceof Error ? error.message : "Failed to import provider models";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
