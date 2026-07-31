// AI Provider 统一接口
// 支持多个代理平台: Grsai, Apimart

import {
  getProviderDefinition,
  getProviderRuntimeConfig,
  type ProviderName,
  type ProviderRuntimeConfig,
} from "@/lib/provider-config";
import { createAdminClient } from "@/lib/supabase/admin";

export type { ProviderName } from "@/lib/provider-config";

export interface ProviderConfigurationStatus {
  provider: string;
  supported: boolean;
  configured: boolean;
  environmentVariable: string | null;
  source: "database" | "environment" | null;
  baseUrl: string | null;
}

// ==================== 配置 ====================


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
}, config: ProviderRuntimeConfig): Promise<GenerationResult> {
  const body = {
    model: params.model,
    prompt: params.prompt,
    images: params.images || [],
    aspectRatio: params.aspectRatio || (params.type === "image" ? "1024x1024" : "1280x720"),
    replyType: "json",
  };

  console.log("[Grsai] request:", JSON.stringify(body));

  const res = await fetch(`${config.base_url}/v1/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.api_key}`,
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

async function grsaiQueryResult(taskId: string, config: ProviderRuntimeConfig): Promise<GenerationResult> {
  console.log("[Grsai] queryResult for task:", taskId);

  const res = await fetch(`${config.base_url}/v1/api/result?id=${taskId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.api_key}`,
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
}, config: ProviderRuntimeConfig): Promise<GenerationResult> {
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

  const res = await fetch(`${config.base_url}/v1/videos/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.api_key}`,
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

async function apimartQueryResult(taskId: string, config: ProviderRuntimeConfig): Promise<GenerationResult> {
  console.log("[Apimart] queryResult for task:", taskId);

  const res = await fetch(`${config.base_url}/v1/tasks/${taskId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.api_key}`,
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

export async function getProviderConfigurationStatus(provider: string): Promise<ProviderConfigurationStatus> {
  const normalized = provider.trim().toLowerCase();
  const definition = getProviderDefinition(normalized);
  const runtimeConfig = definition ? await getProviderRuntimeConfig(normalized) : null;

  return {
    provider: normalized || provider,
    supported: Boolean(definition),
    configured: Boolean(runtimeConfig),
    environmentVariable: definition?.environment_variable || null,
    source: runtimeConfig?.source || null,
    baseUrl: runtimeConfig?.base_url || definition?.default_base_url || null,
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

  const providerConfig = await getProviderRuntimeConfig(params.provider);
  if (!providerConfig) {
    throw new Error(`Provider ${params.provider} is not configured`);
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
    }, providerConfig);
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
  }, providerConfig);
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
    const providerConfig = await getProviderRuntimeConfig(provider);
    if (!providerConfig) {
      return { status: "failed", error: `Provider ${provider} is not configured` };
    }

    let result: GenerationResult;

    if (provider === "apimart") {
      result = await apimartQueryResult(taskId, providerConfig);
    } else {
      result = await grsaiQueryResult(taskId, providerConfig);
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

export interface ProviderCatalogModel {
  id: string;
  suggested_id: string;
  name: string;
  description: string;
  type: "video" | "image";
  capabilities: string[];
}

export async function listProviderModels(provider: string): Promise<ProviderCatalogModel[]> {
  const definition = getProviderDefinition(provider);
  if (!definition) throw new Error("Unsupported provider");

  const config = await getProviderRuntimeConfig(definition.provider);
  if (!config) throw new Error(`Provider ${definition.display_name} is not configured`);

  const response = await fetch(joinUrl(config.base_url, config.models_path), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.api_key}`,
    },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`${definition.display_name} model list request failed (${response.status}): ${responseText.slice(0, 240)}`);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(responseText);
  } catch {
    throw new Error(`${definition.display_name} returned an invalid JSON model list`);
  }

  const items = extractModelItems(payload);
  const seen = new Set<string>();
  return items
    .map((item) => normalizeCatalogModel(item, definition.provider))
    .filter((item): item is ProviderCatalogModel => Boolean(item))
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
}

export async function testProviderConnection(provider: string) {
  const definition = getProviderDefinition(provider);
  if (!definition) return { status: "failed" as const, message: "Unsupported provider" };

  const startedAt = Date.now();
  try {
    const models = await listProviderModels(definition.provider);
    const message = `连接成功，返回 ${models.length} 个模型，耗时 ${Date.now() - startedAt}ms`;
    await updateProviderTestResultSafely(definition.provider, "passed", message);
    return { status: "passed" as const, message, model_count: models.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "连接失败";
    await updateProviderTestResultSafely(definition.provider, "failed", message);
    return { status: "failed" as const, message };
  }
}

export async function importProviderModels(provider: string, selectedIds: string[]) {
  const definition = getProviderDefinition(provider);
  if (!definition) throw new Error("Unsupported provider");

  const catalog = await listProviderModels(definition.provider);
  const selected = selectedIds.length > 0
    ? catalog.filter((item) => selectedIds.includes(item.id))
    : catalog;
  if (selected.length === 0) throw new Error("No provider models selected");

  const admin = createAdminClient();
  const { data: existing, error: existingError } = await admin
    .from("models")
    .select("id, provider, provider_model_id, credits_cost, sort_order, is_active");
  if (existingError) throw existingError;

  const existingByProviderId = new Map((existing || [])
    .filter((item) => item.provider === definition.provider)
    .map((item) => [item.provider_model_id, item]));
  const reservedIds = new Set((existing || []).map((item) => item.id));
  const rows = selected.map((item, index) => {
    const existingModel = existingByProviderId.get(item.id);
    const modelId = existingModel?.id || getAvailableModelId(item.suggested_id, definition.provider, reservedIds);
    reservedIds.add(modelId);
    return {
      id: modelId,
      name: item.name,
      provider: definition.provider,
      provider_model_id: item.id,
      type: item.type,
      description: item.description,
      capabilities: item.capabilities,
      credits_cost: existingModel?.credits_cost ?? 20,
      sort_order: existingModel?.sort_order ?? 100 + index,
      is_active: existingModel?.is_active ?? true,
      updated_at: new Date().toISOString(),
    };
  });

  const { data, error } = await admin
    .from("models")
    .upsert(rows, { onConflict: "id" })
    .select("*");
  if (error) throw error;
  return data || [];
}

function extractModelItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.models)) return payload.models;
  if (isRecord(payload.data) && Array.isArray(payload.data.models)) return payload.data.models;
  return [];
}

function normalizeCatalogModel(value: unknown, provider: ProviderName): ProviderCatalogModel | null {
  const item = typeof value === "string" ? { id: value } : value;
  if (!isRecord(item) || typeof item.id !== "string" || !item.id.trim()) return null;

  const id = item.id.trim();
  const name = readString(item.name) || readString(item.display_name) || id;
  const description = readString(item.description) || `${name} via ${provider}`;
  const type = /image|flux|imagen/i.test(`${id} ${name}`) ? "image" : "video";
  const capabilities = Array.isArray(item.capabilities)
    ? item.capabilities.filter((entry): entry is string => typeof entry === "string").slice(0, 20)
    : [];

  return {
    id,
    suggested_id: toModelId(provider, id),
    name: name.slice(0, 160),
    description: description.slice(0, 500),
    type,
    capabilities,
  };
}

function toModelId(provider: ProviderName, value: string) {
  const normalized = value.replace(/[^A-Za-z0-9._:-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
  const candidate = normalized || `${provider}-model`;
  return /^[A-Za-z0-9]/.test(candidate) && candidate.length >= 2 ? candidate : `${provider}-${candidate}`;
}

function getAvailableModelId(candidate: string, provider: ProviderName, reservedIds: Set<string>) {
  if (!reservedIds.has(candidate)) return candidate;

  const prefix = `${provider}-`;
  const fallback = `${prefix}${candidate}`.slice(0, 128);
  if (!reservedIds.has(fallback)) return fallback;

  let index = 2;
  let next = `${fallback}-${index}`.slice(0, 128);
  while (reservedIds.has(next)) {
    index += 1;
    next = `${fallback}-${index}`.slice(0, 128);
  }
  return next;
}

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function updateProviderTestResultSafely(provider: ProviderName, status: "passed" | "failed", message: string) {
  try {
    const { updateProviderTestResult } = await import("@/lib/provider-config");
    await updateProviderTestResult(provider, status, message);
  } catch (error) {
    console.error("Provider test result persistence failed:", error);
  }
}
