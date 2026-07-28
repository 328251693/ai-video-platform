import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { submitGeneration } from "@/lib/providers";
import { uploadUrlToR2, isR2Configured } from "@/lib/r2";
import { getModelCredits } from "@/lib/models";
import { moderatePrompt, ModerationUnavailableError } from "@/lib/moderation";

// POST /api/generate - Create a new generation task
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile with credits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, credits_remaining, plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { model_id, prompt, input_params = {} } = body;

    if (!model_id || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Missing model_id or prompt" },
        { status: 400 }
      );
    }

    // Get model info
    const { data: model, error: modelError } = await supabase
      .from("models")
      .select("id, name, provider, type")
      .eq("id", model_id)
      .eq("is_active", true)
      .single();

    if (modelError || !model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // 图片和视频生成必须先通过 Creem 审核，审核失败时禁止继续扣费或调用模型。
    if (model.type === "image" || model.type === "video") {
      try {
        const moderation = await moderatePrompt(
          prompt.trim(),
          `user_${user.id}:request_${crypto.randomUUID()}`,
        );

        if (moderation.decision !== "allow") {
          return NextResponse.json(
            { error: "Your prompt was rejected because it violates our content policy. Please revise and try again." },
            { status: 400 },
          );
        }
      } catch (error) {
        console.error("Content moderation error:", error);
        const message = error instanceof ModerationUnavailableError
          ? "Content moderation is temporarily unavailable. Please try again later."
          : "Content moderation failed. Please try again later.";
        return NextResponse.json({ error: message }, { status: 503 });
      }
    }

    // Check credits
    if (profile.credits_remaining <= 0) {
      return NextResponse.json(
        { error: "Insufficient credits. Please purchase more credits." },
        { status: 402 }
      );
    }

    const creditsEstimate = getModelCredits(model_id);

    if (profile.credits_remaining < creditsEstimate) {
      return NextResponse.json(
        { error: `Insufficient credits. Need ${creditsEstimate}, have ${profile.credits_remaining}` },
        { status: 402 }
      );
    }

    // Create generation task
    const { data: task, error: taskError } = await supabase
      .from("generation_tasks")
      .insert({
        user_id: profile.id,
        model_id,
        prompt,
        input_params,
        status: "pending",
        credits_used: creditsEstimate,
      })
      .select()
      .single();

    if (taskError) {
      console.error("Task creation error:", taskError);
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 }
      );
    }

    const { data: creditResult, error: creditError } = await supabase.rpc("consume_credits", {
      p_user_id: profile.id,
      p_amount: creditsEstimate,
      p_reference_id: task.id,
    });

    if (creditError) {
      await supabase.from("generation_tasks").delete().eq("id", task.id);
      return NextResponse.json({ error: "Credits could not be reserved" }, { status: 409 });
    }

    const creditsRemaining = Number((creditResult as { balance_after?: number })?.balance_after ?? profile.credits_remaining - creditsEstimate);

    // Call upstream AI provider
    try {
      const provider = model.provider;
      const type = model.type === "image" ? "image" : "video";

      console.log("[Generate] Calling submitGeneration with:", { prompt, model_id, type, provider });
      console.log("[Generate] apimart_key exists:", !!process.env.apimart_key);

      const providerResult = await submitGeneration({
        prompt,
        model: model_id,
        duration: input_params.duration,
        aspect_ratio: input_params.aspect_ratio,
        image_url: input_params.image_url,
        type,
        resolution: input_params.resolution,
      });

      console.log("[Generate] Provider result:", providerResult);

      // Store provider info in metadata for status queries
      const metadata = {
        provider,
        provider_task_id: providerResult.provider_task_id,
      };

      console.log("[Generate] Updating task:", task.id, "with metadata:", metadata);

      // Check if the task completed synchronously
      if (providerResult.status === "succeeded" && providerResult.output_url) {
        // 上传到 R2
        let finalUrl = providerResult.output_url;
        if (isR2Configured()) {
          try {
            const ext = model_id === "gpt-image-2" ? "png" : "mp4";
            const key = `outputs/${profile.id}/${task.id}.${ext}`;
            console.log("[R2] Uploading to R2:", key);
            finalUrl = await uploadUrlToR2(providerResult.output_url, key);
            console.log("[R2] Uploaded successfully:", finalUrl);
          } catch (r2Err) {
            console.error("[R2] Upload failed, using original URL:", r2Err);
          }
        }

        // Task completed immediately
        const { data: updateData, error: updateError } = await supabase
          .from("generation_tasks")
          .update({
            status: "completed",
            output_url: finalUrl,
            metadata,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          })
          .eq("id", task.id)
          .select();

        console.log("[Generate] Update to completed result:", { updateData, updateError });

        if (updateError) {
          console.error("[Generate] Task update to completed error:", updateError);
        }
      } else {
        // Task is still processing
        const { data: updateData, error: updateError } = await supabase
          .from("generation_tasks")
          .update({
            status: "processing",
            metadata,
            started_at: new Date().toISOString(),
          })
          .eq("id", task.id)
          .select();

        console.log("[Generate] Update to processing result:", { updateData, updateError });

        if (updateError) {
          console.error("[Generate] Task update to processing error:", updateError);
        }
      }

      return NextResponse.json({
        task_id: task.id,
        credits_remaining: creditsRemaining,
      });
    } catch (providerError) {
      console.error("[Generate] Provider submission error:", providerError);
      // Mark task as failed and refund credits
      const { error: failUpdateError } = await supabase
        .from("generation_tasks")
        .update({ status: "failed", error_message: String(providerError) })
        .eq("id", task.id);

      if (failUpdateError) {
        console.error("[Generate] Task update to failed error:", failUpdateError);
      }

      await supabase.rpc("refund_credits", {
        p_user_id: profile.id,
        p_amount: creditsEstimate,
        p_reference_id: task.id,
      });

      return NextResponse.json(
        { error: `Generation failed: ${providerError}` },
        { status: 502 }
      );
    }

      return NextResponse.json({ task_id: task.id, credits_remaining: creditsRemaining });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/generate - Get generation tasks
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get tasks
    const { data: tasks, error } = await supabase
      .from("generation_tasks")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Tasks fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json({ tasks: tasks || [] });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
