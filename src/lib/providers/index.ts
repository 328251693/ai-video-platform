// AI Provider 统一接口
// 支持多个代理平台: Grsai, Apimart

export type ProviderName = "grsai" | "apimart";

export interface ProviderConfigurationStatus {
  provider: string;
  supported: boolean;
  configured: boolean;
  environmentVariable: string | null;
}

// ==================== 配置 ====================

const GRSAI_BASE_URL = process.env.GRSAI_BASE_URL || "https://grsaiapi.com";
const GRSAI_KEY = process.env.grsai_key || "";

const APIMART_BASE_URL = "https://api.apimart.ai";
const APIMART_KEY = process.env.apimart_key || "";

// ==================== 通用类型 ====================

export interface GenerationResult {
  id: string;
  status: "running" | "succeeded" | "failed" | "violation" | "submitted";
  results?: { url: string }[];
  progress?: number;
  error?: string;
}

export interface GenerationStatus {
  status: "pending" | "processing" | "completed" | "failed";
  output_url?: string;
  error?: string;
}

// ==================== Grsai Provider ====================

async function grsaiGenerate(params: {
  prompt: string;
  model: string;
  images?: string[];
  aspectRatio?: string;
  type: "video" | "image";
}): Promise<GenerationResult> {
  const body = {
    model: params.model,
    prompt: params.prompt,
    images: params.images || [],
    aspectRatio: params.aspectRatio || (params.type === "image" ? "1024x1024" : "1280x720"),
    replyType: "json",
  };

  console.log("[Grsai] request:", JSON.stringify(body));

  const res = await fetch(`${GRSAI_BASE_URL}/v1/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GRSAI_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const responseText = await res.text();
  console.log("[Grsai] response:", res.status, responseText);

  if (!res.ok) {
    throw new Error(`Grsai error (${res.status}): ${responseText}`);
  }

  const data = JSON.parse(responseText);
  if (!data.id) {
    throw new Error(`Grsai error: No task ID in response: ${responseText}`);
  }

  return data;
}

async function grsaiQueryResult(taskId: string): Promise<GenerationResult> {
  console.log("[Grsai] queryResult for task:", taskId);

  const res = await fetch(`${GRSAI_BASE_URL}/v1/api/result?id=${taskId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${GRSAI_KEY}`,
    },
  });

  const responseText = await res.text();
  console.log("[Grsai] queryResult response:", res.status, responseText);

  if (!res.ok) {
    throw new Error(`Grsai query error (${res.status}): ${responseText}`);
  }

  return JSON.parse(responseText);
}

// ==================== Apimart Provider ====================

async function apimartGenerateVideo(params: {
  prompt: string;
  model: string;
  duration?: number;
  resolution?: string;
  first_frame_image?: string;
}): Promise<GenerationResult> {
  const body: Record<string, unknown> = {
    model: params.model,
    prompt: params.prompt,
    duration: params.duration || 6,
    resolution: params.resolution || "768p",
    prompt_optimizer: true,
    fast_pretreatment: false,
    watermark: false,
  };

  if (params.first_frame_image) {
    body.first_frame_image = params.first_frame_image;
  }

  console.log("[Apimart] generateVideo request:", JSON.stringify(body));

  const res = await fetch(`${APIMART_BASE_URL}/v1/videos/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${APIMART_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const responseText = await res.text();
  console.log("[Apimart] generateVideo response:", res.status, responseText);

  if (!res.ok) {
    throw new Error(`Apimart error (${res.status}): ${responseText}`);
  }

  const data = JSON.parse(responseText);

  if (data.code !== 200 || !data.data?.[0]?.task_id) {
    throw new Error(`Apimart error: ${JSON.stringify(data)}`);
  }

  return {
    id: data.data[0].task_id,
    status: "submitted",
  };
}

async function apimartQueryResult(taskId: string): Promise<GenerationResult> {
  console.log("[Apimart] queryResult for task:", taskId);

  const res = await fetch(`${APIMART_BASE_URL}/v1/tasks/${taskId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${APIMART_KEY}`,
    },
  });

  const responseText = await res.text();
  console.log("[Apimart] queryResult response:", res.status, responseText);

  if (!res.ok) {
    throw new Error(`Apimart query error (${res.status}): ${responseText}`);
  }

  const data = JSON.parse(responseText);

  // Apimart 返回格式: { code: 200, data: { status: "completed", progress: 100, result: { videos: [{ url: ["..."] }] } } }
  const task = data.data || data;

  let status: GenerationResult["status"] = "running";
  if (task.status === "completed" || task.status === "succeed" || task.status === "success") {
    status = "succeeded";
  } else if (task.status === "failed" || task.status === "error") {
    status = "failed";
  }

  // 提取视频 URL: result.videos[0].url[0]
  let videoUrl: string | undefined;
  if (task.result?.videos?.[0]?.url) {
    const urlField = task.result.videos[0].url;
    videoUrl = Array.isArray(urlField) ? urlField[0] : urlField;
  }

  console.log("[Apimart] Extracted video URL:", videoUrl);

  return {
    id: taskId,
    status,
    results: videoUrl ? [{ url: videoUrl }] : undefined,
    progress: task.progress,
    error: task.error,
  };
}

// ==================== 统一接口 ====================

export function isSupportedProvider(provider: string): provider is ProviderName {
  return provider === "grsai" || provider === "apimart";
}

export function getProviderConfigurationStatus(provider: string): ProviderConfigurationStatus {
  const normalized = provider.trim().toLowerCase();
  const environmentVariable = normalized === "grsai"
    ? "grsai_key"
    : normalized === "apimart"
      ? "apimart_key"
      : null;

  return {
    provider: normalized || provider,
    supported: environmentVariable !== null,
    configured: environmentVariable ? Boolean(process.env[environmentVariable]) : false,
    environmentVariable,
  };
}

export async function submitGeneration(params: {
  prompt: string;
  model: string;
  provider: string;
  provider_model_id?: string | null;
  duration?: number;
  aspect_ratio?: string;
  image_url?: string;
  type?: "video" | "image";
  resolution?: string;
}): Promise<{ provider_task_id: string; status?: string; output_url?: string }> {
  if (!isSupportedProvider(params.provider)) {
    throw new Error(`Unsupported AI provider: ${params.provider}`);
  }

  const providerModelId = params.provider_model_id || params.model;
  console.log("[Provider] submitGeneration:", { provider: params.provider, model: providerModelId, type: params.type });

  if (params.provider === "apimart") {
    if (params.type === "image") {
      throw new Error("Apimart image generation is not configured");
    }

    const result = await apimartGenerateVideo({
      prompt: params.prompt,
      model: providerModelId,
      duration: params.duration,
      resolution: params.resolution,
      first_frame_image: params.image_url,
    });
    return {
      provider_task_id: result.id,
      status: result.status,
      output_url: result.results?.[0]?.url,
    };
  }

  // Grsai provider
  const images = params.image_url ? [params.image_url] : [];
  const result = await grsaiGenerate({
    prompt: params.prompt,
    model: providerModelId,
    images,
    aspectRatio: params.aspect_ratio,
    type: params.type || "video",
  });
  return {
    provider_task_id: result.id,
    status: result.status,
    output_url: result.results?.[0]?.url,
  };
}

export async function checkGenerationStatus(
  provider: string,
  taskId: string
): Promise<GenerationStatus> {
  try {
    let result: GenerationResult;

    if (provider === "apimart") {
      result = await apimartQueryResult(taskId);
    } else {
      result = await grsaiQueryResult(taskId);
    }

    if (result.status === "succeeded") {
      return {
        status: "completed",
        output_url: result.results?.[0]?.url,
      };
    }

    if (result.status === "failed" || result.status === "violation") {
      return {
        status: "failed",
        error: result.error || "Generation failed",
      };
    }

    return { status: "processing" };
  } catch (err) {
    console.error("[Provider] checkGenerationStatus error:", err);
    return { status: "processing" };
  }
}
