"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  ScrollText,
  ReceiptText,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { AdminRole } from "@/lib/admin";

const navigation = [
  { href: "/admin/audit-logs", label: "操作日志", icon: ScrollText },
  { href: "/admin", label: "总览", icon: LayoutDashboard },
  { href: "/admin/users", label: "用户账户", icon: Users },
  { href: "/admin/transactions", label: "Credits 流水", icon: ReceiptText },
  { href: "/admin/tasks", label: "生成任务", icon: ClipboardList },
  { href: "/admin/models", label: "模型目录", icon: Boxes },
];

export default function AdminSidebar({ email, role }: { email: string; role: AdminRole }) {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <span className="admin-sidebar__mark"><ChartNoAxesCombined size={17} /></span>
        <div>
          <p className="admin-sidebar__eyebrow">FrameForge</p>
          <p className="admin-sidebar__title">运营控制台</p>
        </div>
      </div>

      <div className="admin-sidebar__section-label">Workspace</div>
      <nav className="admin-sidebar__nav" aria-label="管理后台导航">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href} className={`admin-nav-link${active ? " is-active" : ""}`}>
              <Icon size={16} strokeWidth={1.8} />
              <span>{item.label}</span>
              {active && <span className="admin-nav-link__pulse" />}
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar__spacer" />
      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__status"><span />生产环境 · 已连接</div>
        <div className="admin-sidebar__identity">
          <div className="admin-avatar">{email.slice(0, 1).toUpperCase()}</div>
          <div className="min-w-0">
            <p className="admin-sidebar__email">{email}</p>
            <p className="admin-sidebar__role"><ShieldCheck size={12} /> {role}</p>
          </div>
        </div>
        <Link href="/" className="admin-back-link"><ExternalLink size={13} /> 返回网站</Link>
      </div>
    </aside>
  );
}
