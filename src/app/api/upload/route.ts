import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToR2, isR2Configured } from "@/lib/r2";

// POST /api/upload - Upload file to R2
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isR2Configured()) {
      return NextResponse.json({ error: "R2 storage not configured" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 限制文件大小 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "bin";
    const key = `uploads/${user.id}/${Date.now()}.${ext}`;

    const url = await uploadToR2(buffer, key, file.type);

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
