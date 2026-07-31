import "server-only";

import { Creem } from "creem";

import {
  BILLING_PLANS,
  type BillingCycle,
  type BillingPlan,
  type BillingPlanKey,
  getBillingPlan,
} from "@/lib/billing";

const PRODUCT_ENV_NAMES: Record<BillingPlanKey, Record<BillingCycle, string>> = {
  basic: {
    monthly: "CREEM_PRODUCT_BASIC_MONTHLY",
    annual: "CREEM_PRODUCT_BASIC_ANNUAL",
    one_time: "CREEM_PRODUCT_BASIC_ONE_TIME",
  },
  pro: {
    monthly: "CREEM_PRODUCT_PRO_MONTHLY",
    annual: "CREEM_PRODUCT_PRO_ANNUAL",
    one_time: "CREEM_PRODUCT_PRO_ONE_TIME",
  },
  plus: {
    monthly: "CREEM_PRODUCT_PLUS_MONTHLY",
    annual: "CREEM_PRODUCT_PLUS_ANNUAL",
    one_time: "CREEM_PRODUCT_PLUS_ONE_TIME",
  },
  ultra: {
    monthly: "CREEM_PRODUCT_ULTRA_MONTHLY",
    annual: "CREEM_PRODUCT_ULTRA_ANNUAL",
    one_time: "CREEM_PRODUCT_ULTRA_ONE_TIME",
  },
};

export function getCreemProductEnvName(key: BillingPlanKey, cycle: BillingCycle) {
  return PRODUCT_ENV_NAMES[key][cycle];
}

export function getCreemProductId(key: BillingPlanKey, cycle: BillingCycle) {
  return process.env[getCreemProductEnvName(key, cycle)]?.trim() || null;
}

export function createCreemClient() {
  const apiKey = process.env.CREEM_API_KEY?.trim();
  if (!apiKey) throw new Error("Creem payment is not configured");

  return new Creem({
    apiKey,
    server: process.env.CREEM_TEST_MODE === "true" ? "test" : "prod",
  });
}

export function getBillingPlanByProductId(productId: string | null | undefined) {
  if (!productId) return null;

  for (const plan of BILLING_PLANS) {
    if (getCreemProductId(plan.key, plan.cycle) === productId) {
      return plan;
    }
  }

  return null;
}

export function getBillingPlanFromMetadata(
  planKey: unknown,
  cycle: unknown,
): BillingPlan | null {
  if (typeof planKey !== "string" || typeof cycle !== "string") return null;
  if (cycle !== "monthly" && cycle !== "annual" && cycle !== "one_time") return null;
  return getBillingPlan(planKey, cycle) || null;
}

export function getCreemBaseUrl() {
  if (process.env.CREEM_API_BASE_URL) {
    return process.env.CREEM_API_BASE_URL.replace(/\/$/, "");
  }

  const useTestMode =
    process.env.CREEM_TEST_MODE === "true" || process.env.NODE_ENV !== "production";

  return useTestMode ? "https://test-api.creem.io" : "https://api.creem.io";
}

export function getAppUrl() {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  return (url || "http://localhost:3000").replace(/\/$/, "");
}
