import "server-only";

import { Creem } from "creem";

export function createCreemClient() {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) throw new Error("CREEM_API_KEY is not configured");

  return new Creem({
    apiKey,
    server: process.env.CREEM_TEST_MODE === "true" ? "test" : "prod",
  });
}

export function getAppUrl(origin?: string) {
  return (process.env.NEXT_PUBLIC_APP_URL || origin || "http://localhost:3000").replace(/\/$/, "");
}

export function getOrderIdFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const value = (metadata as Record<string, unknown>).orderId;
  return typeof value === "string" ? value : null;
}

export function getProviderId(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}
