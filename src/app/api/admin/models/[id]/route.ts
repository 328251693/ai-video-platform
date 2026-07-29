import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeModelProvider } from "@/lib/models";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  if (auth.context.role === "support") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = readText(body.name, "name");
    if (body.provider !== undefined) {
      const provider = normalizeModelProvider(readText(body.provider, "provider"));
      if (!provider) throw new Error("Provider must be grsai or apimart");
      updates.provider = provider;
    }
    if (body.provider_model_id !== undefined) updates.provider_model_id = readText(body.provider_model_id, "provider_model_id");
    if (body.type !== undefined) {
      if (body.type !== "video" && body.type !== "image") throw new Error("Type must be video or image");
      updates.type = body.type;
    }
    if (body.description !== undefined) updates.description = typeof body.description === "string" ? body.description.trim().slice(0, 500) : "";
    if (body.icon_url !== undefined) updates.icon_url = typeof body.icon_url === "string" ? body.icon_url.trim().slice(0, 500) : null;
    if (body.parameters !== undefined) updates.parameters = isPlainObject(body.parameters) ? body.parameters : {};
    if (body.capabilities !== undefined) updates.capabilities = Array.isArray(body.capabilities) ? body.capabilities : [];
    if (body.credits_cost !== undefined) updates.credits_cost = readInteger(body.credits_cost, "credits_cost", 0);
    if (body.sort_order !== undefined) updates.sort_order = readInteger(body.sort_order, "sort_order", 0);
    if (body.is_active !== undefined) {
      if (typeof body.is_active !== "boolean") throw new Error("is_active must be boolean");
      updates.is_active = body.is_active;
    }

    if (Object.keys(updates).length === 0) throw new Error("No changes supplied");
    updates.updated_at = new Date().toISOString();

    const adminClient = createAdminClient();
    const { data, error } = await adminClient.from("models").update(updates).eq("id", id).select("*").single();
    if (error) {
      const status = error.code === "PGRST116" ? 404 : 400;
      return NextResponse.json({ error: error.code === "PGRST116" ? "Model not found" : error.message }, { status });
    }

    return NextResponse.json({ model: data });
  } catch (error) {
    console.error("Admin model update error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid model configuration" }, { status: 400 });
  }
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
