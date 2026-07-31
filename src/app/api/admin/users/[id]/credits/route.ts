import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(["owner", "admin"]);
  if (auth.response) return auth.response;

  try {
    const { id: userId } = await params;
    const body = await request.json() as Record<string, unknown>;
    const amount = Number(body.amount);
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (!Number.isSafeInteger(amount) || amount === 0 || Math.abs(amount) > 1_000_000) {
      return NextResponse.json({ error: "Amount must be an integer between -1000000 and 1000000" }, { status: 400 });
    }
    if (reason.length < 3 || reason.length > 500) {
      return NextResponse.json({ error: "Reason must contain 3-500 characters" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin.rpc("admin_adjust_credits", {
      p_actor_id: auth.context.user.id,
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason,
      p_idempotency_key: typeof body.idempotency_key === "string" ? body.idempotency_key.trim() || crypto.randomUUID() : crypto.randomUUID(),
    });
    if (error) {
      const status = error.message.includes("not found") ? 404 : error.message.includes("Unauthorized") ? 403 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ result: data });
  } catch (error) {
    console.error("Admin credit adjustment error:", error);
    return NextResponse.json({ error: "Invalid credit adjustment" }, { status: 400 });
  }
}
