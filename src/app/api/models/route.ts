import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getModelCreditsFromRecord, normalizeModelProvider } from "@/lib/models";

// GET /api/models - List all available models
export async function GET(request: Request) {
  try {
    const type = new URL(request.url).searchParams.get("type");
    const supabase = await createClient();

    let query = supabase
      .from("models")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (type === "video" || type === "image") {
      query = query.eq("type", type);
    }

    const { data: models, error } = await query;

    if (error) {
      console.error("Models fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch models" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      models: (models || [])
        .filter((model) => normalizeModelProvider(model.provider) !== null)
        .map((model) => ({ ...model, credits: getModelCreditsFromRecord(model) }))
        .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) || a.name.localeCompare(b.name)),
    });
  } catch (error) {
    console.error("Models API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
