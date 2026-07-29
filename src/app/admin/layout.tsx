import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireAdminPage } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const context = await requireAdminPage();

  return (
    <div className="admin-shell">
      <AdminSidebar email={context.user.email ?? "管理员"} role={context.role} />
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-topbar__kicker">Operations / Control Room</span>
            <span className="admin-topbar__title">实时运营数据</span>
          </div>
          <div className="admin-topbar__meta">
            <span className="admin-live-dot" />
            <span>数据读取自 Supabase</span>
          </div>
        </header>
        <div className="admin-main__content">{children}</div>
      </div>
    </div>
  );
}
