import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/models - List all available models
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: models, error } = await supabase
      .from("models")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Models fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch models" },
        { status: 500 }
      );
    }

    return NextResponse.json({ models: models || [] });
  } catch (error) {
    console.error("Models API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}