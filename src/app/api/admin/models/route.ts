import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getAdminModels } from "@/lib/admin-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeModelProvider } from "@/lib/models";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    return NextResponse.json({ models: await getAdminModels() });
  } catch (error) {
    console.error("Admin models API error:", error);
    return NextResponse.json({ error: "Failed to load admin models" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  if (auth.context.role === "support") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const model = parseModelInput(body);
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.from("models").insert(model).select("*").single();

    if (error) {
      const status = error.code === "23505" ? 409 : 400;
      return NextResponse.json({ error: error.code === "23505" ? "Model ID already exists" : error.message }, { status });
    }

    return NextResponse.json({ model: data }, { status: 201 });
  } catch (error) {
    console.error("Admin model create error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid model configuration" }, { status: 400 });
  }
}

function parseModelInput(body: Record<string, unknown>) {
  const id = readText(body.id, "id");
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/.test(id)) {
    throw new Error("Model ID must be 2-128 characters and contain only letters, numbers, dots, underscores, colons, or hyphens");
  }

  const name = readText(body.name, "name");
  const provider = normalizeModelProvider(readText(body.provider, "provider"));
  if (!provider) throw new Error("Provider must be grsai or apimart");

  const type = readText(body.type, "type");
  if (type !== "video" && type !== "image") throw new Error("Type must be video or image");

  const creditsCost = readInteger(body.credits_cost, "credits_cost", 0);
  const sortOrder = readInteger(body.sort_order ?? 0, "sort_order", 0);
  const providerModelId = readText(body.provider_model_id || id, "provider_model_id");
  const description = typeof body.description === "string" ? body.description.trim().slice(0, 500) : "";
  const iconUrl = typeof body.icon_url === "string" ? body.icon_url.trim().slice(0, 500) : null;
  const parameters = isPlainObject(body.parameters) ? body.parameters : {};
  const capabilities = Array.isArray(body.capabilities) ? body.capabilities : [];

  return {
    id,
    name,
    provider,
    provider_model_id: providerModelId,
    type,
    description,
    icon_url: iconUrl,
    parameters,
    capabilities,
    credits_cost: creditsCost,
    sort_order: sortOrder,
    is_active: body.is_active !== false,
  };
}

function readText(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
}

function readInteger(value: unknown, field: string, minimum: number) {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(numberValue) || numberValue < minimum) throw new Error(`${field} must be an integer >= ${minimum}`);
  return numberValue;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
