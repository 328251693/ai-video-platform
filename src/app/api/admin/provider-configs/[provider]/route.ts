import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { saveProviderConfig } from "@/lib/provider-config";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const auth = await requireAdminApi(["owner", "admin"]);
  if (auth.response) return auth.response;

  try {
    const { provider } = await params;
    const input = await request.json() as Record<string, unknown>;
    const baseUrl = typeof input.base_url === "string" ? input.base_url : "";
    const modelsPath = typeof input.models_path === "string" ? input.models_path : undefined;
    const apiKey = typeof input.api_key === "string" ? input.api_key : undefined;

    const config = await saveProviderConfig({
      provider,
      base_url: baseUrl,
      models_path: modelsPath,
      api_key: apiKey,
      clear_api_key: input.clear_api_key === true,
      is_active: typeof input.is_active === "boolean" ? input.is_active : undefined,
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Admin provider config update error:", error);
    const message = error instanceof Error ? error.message : "Invalid provider configuration";
    return NextResponse.json({ error: message }, { status: message.includes("MODEL_CONFIG") ? 503 : 400 });
  }
}
