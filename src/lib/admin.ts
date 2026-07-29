import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminRole = "owner" | "admin" | "support";

export interface AdminContext {
  user: User;
  role: AdminRole;
}

export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Admin role lookup failed: ${error.message}`);
  }

  if (!data || !isAdminRole(data.role)) {
    return null;
  }

  return { user, role: data.role };
}

export async function requireAdminPage() {
  const context = await getAdminContext();

  if (!context) {
    redirect("/login?next=/admin");
  }

  return context;
}

type AdminApiResult =
  | { context: AdminContext; response: null }
  | { context: null; response: NextResponse };

export async function requireAdminApi(): Promise<AdminApiResult> {
  try {
    const context = await getAdminContext();

    if (!context) {
      return {
        context: null,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }

    return { context, response: null };
  } catch (error) {
    console.error("Admin authorization error:", error);
    return {
      context: null,
      response: NextResponse.json(
        { error: "Admin system is not configured" },
        { status: 503 },
      ),
    };
  }
}

function isAdminRole(value: string): value is AdminRole {
  return value === "owner" || value === "admin" || value === "support";
}
