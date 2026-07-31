import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProviderName = "grsai" | "apimart";
export type ProviderTestStatus = "not_tested" | "passed" | "failed";

export interface ProviderDefinition {
  provider: ProviderName;
  display_name: string;
  default_base_url: string;
  default_models_path: string;
  environment_variable: string;
}

export interface ProviderConfigView extends ProviderDefinition {
  base_url: string;
  models_path: string;
  api_key_set: boolean;
  api_key_last4: string | null;
  is_active: boolean;
  source: "database" | "environment";
  last_tested_at: string | null;
  last_test_status: ProviderTestStatus;
  last_test_message: string | null;
  updated_at: string | null;
}

export interface ProviderRuntimeConfig {
  provider: ProviderName;
  base_url: string;
  models_path: string;
  api_key: string;
  source: "database" | "environment";
}

interface StoredProviderConfig {
  provider: string;
  base_url?: string | null;
  models_path?: string | null;
  api_key_ciphertext?: string | null;
  api_key_last4?: string | null;
  is_active?: boolean | null;
  last_tested_at?: string | null;
  last_test_status?: ProviderTestStatus | null;
  last_test_message?: string | null;
  updated_at?: string | null;
}

export const PROVIDER_DEFINITIONS: ProviderDefinition[] = [
  {
    provider: "grsai",
    display_name: "Grsai",
    default_base_url: process.env.GRSAI_BASE_URL || "https://grsaiapi.com",
    default_models_path: "/v1/models",
    environment_variable: "grsai_key",
  },
  {
    provider: "apimart",
    display_name: "Apimart",
    default_base_url: process.env.APIMART_BASE_URL || "https://api.apimart.ai",
    default_models_path: "/v1/models",
    environment_variable: "apimart_key",
  },
];

export function getProviderDefinition(provider: string) {
  return PROVIDER_DEFINITIONS.find((item) => item.provider === provider.trim().toLowerCase());
}

export async function getProviderConfigViews(): Promise<ProviderConfigView[]> {
  const stored = await readStoredConfigs();
  return PROVIDER_DEFINITIONS.map((definition) => {
    const row = stored.get(definition.provider);
    const environmentKey = process.env[definition.environment_variable]?.trim() || "";
    const databaseKey = row?.api_key_ciphertext ? decryptSecret(row.api_key_ciphertext) : "";
    const hasDatabaseKey = Boolean(databaseKey);

    return {
      ...definition,
      base_url: row?.base_url || definition.default_base_url,
      models_path: row?.models_path || definition.default_models_path,
      api_key_set: hasDatabaseKey || Boolean(environmentKey),
      api_key_last4: row?.api_key_last4 || (environmentKey ? environmentKey.slice(-4) : null),
      is_active: row?.is_active ?? true,
      source: hasDatabaseKey || Boolean(row) ? "database" : "environment",
      last_tested_at: row?.last_tested_at || null,
      last_test_status: row?.last_test_status || "not_tested",
      last_test_message: row?.last_test_message || null,
      updated_at: row?.updated_at || null,
    };
  });
}

export async function getProviderRuntimeConfig(provider: string): Promise<ProviderRuntimeConfig | null> {
  const definition = getProviderDefinition(provider);
  if (!definition) return null;

  const row = (await readStoredConfigs()).get(definition.provider);
  if (row?.is_active === false) return null;
  const databaseKey = row?.api_key_ciphertext ? decryptSecret(row.api_key_ciphertext) : "";
  const environmentKey = process.env[definition.environment_variable]?.trim() || "";
  const apiKey = databaseKey || environmentKey;

  if (!apiKey) return null;

  return {
    provider: definition.provider,
    base_url: row?.base_url || definition.default_base_url,
    models_path: row?.models_path || definition.default_models_path,
    api_key: apiKey,
    source: databaseKey ? "database" : "environment",
  };
}

export async function saveProviderConfig(input: {
  provider: string;
  base_url: string;
  models_path?: string;
  api_key?: string;
  clear_api_key?: boolean;
  is_active?: boolean;
}) {
  const definition = getProviderDefinition(input.provider);
  if (!definition) throw new Error("Unsupported provider");

  const baseUrl = normalizeUrl(input.base_url);
  const modelsPath = normalizePath(input.models_path || definition.default_models_path);
  const admin = createAdminClient();
  const { data: existing, error: existingError } = await admin
    .from("provider_configs")
    .select("provider, api_key_ciphertext, api_key_last4, is_active")
    .eq("provider", definition.provider)
    .maybeSingle();

  if (existingError && !isMissingProviderConfigTable(existingError)) throw existingError;

  let encryptedKey = existing?.api_key_ciphertext || null;
  let keyLast4 = existing?.api_key_last4 || null;
  const newKey = input.api_key?.trim() || "";
  if (newKey) {
    encryptedKey = encryptSecret(newKey);
    keyLast4 = newKey.slice(-4);
  } else if (input.clear_api_key) {
    encryptedKey = null;
    keyLast4 = null;
  }

  const { data, error } = await admin
    .from("provider_configs")
    .upsert({
      provider: definition.provider,
      display_name: definition.display_name,
      base_url: baseUrl,
      models_path: modelsPath,
      api_key_ciphertext: encryptedKey,
      api_key_last4: keyLast4,
      is_active: input.is_active ?? existing?.is_active ?? true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "provider" })
    .select("provider, display_name, base_url, models_path, api_key_last4, is_active, last_tested_at, last_test_status, last_test_message, updated_at")
    .single();

  if (error) throw error;
  return data;
}

export async function updateProviderTestResult(provider: string, status: ProviderTestStatus, message: string) {
  const definition = getProviderDefinition(provider);
  if (!definition) throw new Error("Unsupported provider");

  const admin = createAdminClient();
  const testedAt = new Date().toISOString();
  const testFields = {
    last_tested_at: testedAt,
    last_test_status: status,
    last_test_message: message.slice(0, 500),
    updated_at: testedAt,
  };
  const { data: existing, error: readError } = await admin
    .from("provider_configs")
    .select("provider")
    .eq("provider", definition.provider)
    .maybeSingle();

  if (readError) throw readError;

  const result = existing
    ? await admin.from("provider_configs").update(testFields).eq("provider", definition.provider)
    : await admin.from("provider_configs").insert({
      provider: definition.provider,
      display_name: definition.display_name,
      base_url: definition.default_base_url,
      models_path: definition.default_models_path,
      ...testFields,
    });

  if (result.error) throw result.error;
}

export function isMissingProviderConfigTable(error: { code?: string; message?: string }) {
  return error.code === "42P01" || error.code === "PGRST205" || error.message?.includes("provider_configs");
}

function normalizeUrl(value: string) {
  const url = value.trim().replace(/\/+$/, "");
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("base_url must be a valid URL");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("base_url must use http or https");
  }
  return url;
}

function normalizePath(value: string) {
  const path = value.trim();
  if (!path.startsWith("/") || path.includes("?")) throw new Error("models_path must be an absolute path without query parameters");
  return path;
}

function getEncryptionKey() {
  const secret = process.env.MODEL_CONFIG_ENCRYPTION_KEY?.trim();
  if (!secret) throw new Error("MODEL_CONFIG_ENCRYPTION_KEY is not configured");
  return createHash("sha256").update(secret).digest();
}

function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64url")}:${tag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

function decryptSecret(value: string) {
  try {
    const [version, ivText, tagText, encryptedText] = value.split(":");
    if (version !== "v1" || !ivText || !tagText || !encryptedText) return "";
    const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivText, "base64url"));
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(encryptedText, "base64url")), decipher.final()]).toString("utf8");
  } catch (error) {
    console.error("Provider API key decryption failed:", error);
    return "";
  }
}

async function readStoredConfigs() {
  const configs = new Map<string, StoredProviderConfig>();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return configs;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("provider_configs")
    .select("provider, base_url, models_path, api_key_ciphertext, api_key_last4, is_active, last_tested_at, last_test_status, last_test_message, updated_at");

  if (error) {
    if (isMissingProviderConfigTable(error)) return configs;
    throw error;
  }

  for (const row of data || []) configs.set(row.provider, row as StoredProviderConfig);
  return configs;
}
