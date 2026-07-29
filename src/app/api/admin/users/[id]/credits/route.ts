import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  if (auth.context.role === "support") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;
    const amount = readInteger(body.amount);
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (amount === 0) throw new Error("Amount cannot be zero");
    if (reason.length < 3 || reason.length > 500) throw new Error("Reason must contain 3-500 characters");

    const idempotencyKey = typeof body.idempotency_key === "string" && body.idempotency_key.trim()
      ? body.idempotency_key.trim()
      : crypto.randomUUID();
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.rpc("admin_adjust_credits", {
      p_actor_id: auth.context.user.id,
      p_user_id: id,
      p_amount: amount,
      p_reason: reason,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      const status = error.message.includes("not found") ? 404 : error.message.includes("Unauthorized") ? 403 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ result: data });
  } catch (error) {
    console.error("Admin credit adjustment error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid credit adjustment" }, { status: 400 });
  }
}

function readInteger(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(amount) || !Number.isSafeInteger(amount) || Math.abs(amount) > 1000000) {
    throw new Error("Amount must be an integer between -1000000 and 1000000");
  }
  return amount;
}
