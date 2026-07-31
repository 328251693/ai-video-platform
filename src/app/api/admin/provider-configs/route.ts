import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getProviderConfigViews, saveProviderConfig } from "@/lib/provider-config";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    return NextResponse.json({ providers: await getProviderConfigViews() });
  } catch (error) {
    console.error("Admin provider config list error:", error);
    return NextResponse.json({ error: "Failed to load provider configurations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(["owner", "admin"]);
  if (auth.response) return auth.response;

  try {
    const input = await request.json() as Record<string, unknown>;
    const provider = typeof input.provider === "string" ? input.provider : "";
    const baseUrl = typeof input.base_url === "string" ? input.base_url : "";
    const modelsPath = typeof input.models_path === "string" ? input.models_path : undefined;
    const apiKey = typeof input.api_key === "string" ? input.api_key : undefined;

    const config = await saveProviderConfig({
      provider,
      base_url: baseUrl,
      models_path: modelsPath,
      api_key: apiKey,
      is_active: input.is_active !== false,
    });

    return NextResponse.json({ config }, { status: 201 });
  } catch (error) {
    console.error("Admin provider config create error:", error);
    const message = error instanceof Error ? error.message : "Invalid provider configuration";
    return NextResponse.json({ error: message }, { status: message.includes("MODEL_CONFIG") ? 503 : 400 });
  }
}
