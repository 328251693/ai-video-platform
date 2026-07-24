import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getModelCredits } from "@/lib/models";

// GET /api/models - List all available models
export async function GET(request: Request) {
  try {
    const type = new URL(request.url).searchParams.get("type");
    const supabase = await createClient();

    let query = supabase
      .from("models")
      .select("id, name, provider, type, description, is_active")
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
      models: (models || []).map((model) => ({
        ...model,
        credits: getModelCredits(model.id),
      })),
    });
  } catch (error) {
    console.error("Models API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
