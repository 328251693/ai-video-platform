import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminOverview() {
  const adminClient = createAdminClient();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const [users, activeTasks, purchasedCredits, consumedCredits] = await Promise.all([
    adminClient.from("profiles").select("id", { count: "exact", head: true }),
    adminClient
      .from("generation_tasks")
      .select("id", { count: "exact", head: true })
      .eq("status", "processing"),
    adminClient
      .from("credit_transactions")
      .select("amount")
      .eq("source", "purchase")
      .gte("created_at", dayStart.toISOString()),
    adminClient
      .from("credit_transactions")
      .select("amount")
      .eq("source", "generation")
      .gte("created_at", dayStart.toISOString()),
  ]);

  const firstError = [users.error, activeTasks.error, purchasedCredits.error, consumedCredits.error].find(Boolean);
  if (firstError) {
    throw new Error(`Admin overview query failed: ${firstError.message}`);
  }

  return {
    totalUsers: users.count ?? 0,
    activeTasks: activeTasks.count ?? 0,
    purchasedCreditsToday: sumAmounts(purchasedCredits.data),
    consumedCreditsToday: Math.abs(sumAmounts(consumedCredits.data)),
  };
}

export async function getAdminUsers() {
  const adminClient = createAdminClient();
  const [{ data: profiles, error: profileError }, { data: authData, error: authError }] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id, username, plan, credits_remaining, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(100),
    adminClient.auth.admin.listUsers({ page: 1, perPage: 100 }),
  ]);

  if (profileError || authError) {
    throw new Error(`Admin users query failed: ${profileError?.message ?? authError?.message}`);
  }

  const emails = new Map((authData.users ?? []).map((user) => [user.id, user.email ?? ""]));

  return (profiles ?? []).map((profile) => ({
    ...profile,
    email: emails.get(profile.id) ?? "未获取邮箱",
  }));
}

export async function getAdminTransactions() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("credit_transactions")
    .select("id, user_id, amount, balance_after, source, reference_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Admin transactions query failed: ${error.message}`);
  }

  return data ?? [];
}

export async function getAdminTasks() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("generation_tasks")
    .select("id, user_id, model_id, status, credits_used, prompt, error_message, created_at, completed_at, retry_count, last_retry_at, credits_refunded_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Admin tasks query failed: ${error.message}`);
  }

  return data ?? [];
}

export async function getAdminOrders() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("billing_orders")
    .select("id, user_id, request_id, checkout_id, creem_order_id, creem_product_id, plan_key, billing_cycle, credits_amount, amount, currency, status, created_at, updated_at, paid_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Admin orders query failed: ${error.message}`);
  }

  return data ?? [];
}

export async function getAdminBillingRefunds() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("billing_refunds")
    .select("id, order_id, user_id, amount, currency, credits_to_revoke, status, reason, provider_refund_id, external_reference, requested_by, approved_by, created_at, updated_at, completed_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Admin refunds query failed: ${error.message}`);
  }

  return data ?? [];
}

export async function getAdminPaymentEvents() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("billing_webhook_events")
    .select("event_id, event_type, status, error_message, received_at, processed_at")
    .order("received_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Admin payment events query failed: ${error.message}`);
  }

  return data ?? [];
}

export async function getAdminModels() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("models")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name");

  if (error) {
    throw new Error(`Admin models query failed: ${error.message}`);
  }

  return (data ?? []).sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) || a.name.localeCompare(b.name));
}

function sumAmounts(rows: Array<{ amount: number }> | null) {
  return (rows ?? []).reduce((total, row) => total + Number(row.amount || 0), 0);
}
