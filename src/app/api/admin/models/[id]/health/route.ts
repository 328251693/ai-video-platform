import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getProviderConfigurationStatus } from "@/lib/providers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  void request;
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const adminClient = createAdminClient();
    const { data: model, error } = await adminClient
      .from("models")
      .select("id, provider, provider_model_id, is_active")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!model) return NextResponse.json({ error: "Model not found" }, { status: 404 });

    const configuration = await getProviderConfigurationStatus(model.provider);
    const status = !configuration.supported
      ? "unsupported"
      : !configuration.configured
        ? "missing_key"
        : "ready";

    return NextResponse.json({
      model_id: model.id,
      provider: configuration.provider,
      provider_model_id: model.provider_model_id || model.id,
      active: model.is_active,
      status,
      environment_variable: configuration.environmentVariable,
      source: configuration.source,
      base_url: configuration.baseUrl,
      checked_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Admin model health check error:", error);
    return NextResponse.json({ error: "Failed to check model configuration" }, { status: 500 });
  }
}
