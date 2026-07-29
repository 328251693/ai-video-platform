import Link from "next/link";
import { ArrowUpRight, Boxes, ClipboardList, ReceiptText, Users } from "lucide-react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { getAdminOverview } from "@/lib/admin-data";

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <span className="admin-eyebrow">Daily pulse · 01</span>
          <h1>运营控制室</h1>
          <p>掌握账户、Credits 和生成队列的实时状态。支付与退款模块将在下一阶段接入。</p>
        </div>
        <div className="admin-hero__signal">
          <span className="admin-hero__signal-ring" />
          <span>系统在线</span>
        </div>
      </section>

      <section className="admin-stat-grid" aria-label="核心指标">
        <AdminStatCard label="总用户" value={overview.totalUsers} detail="已创建账户" icon={Users} accent="blue" />
        <AdminStatCard label="处理中任务" value={overview.activeTasks} detail="当前生成队列" icon={ClipboardList} accent="amber" />
        <AdminStatCard label="今日购买 Credits" value={overview.purchasedCreditsToday} detail="支付模块接入后启用" icon={ReceiptText} accent="green" />
        <AdminStatCard label="今日消耗 Credits" value={overview.consumedCreditsToday} detail="生成任务实际消耗" icon={Boxes} accent="red" />
      </section>

      <section className="admin-section-heading">
        <div>
          <span className="admin-eyebrow">Launchpad</span>
          <h2>快速进入</h2>
        </div>
        <span className="admin-section-heading__note">阶段 1 · 只读运营能力</span>
      </section>

      <section className="admin-quick-grid">
        {[
          { href: "/admin/users", label: "用户账户", description: "查看余额、套餐和账户状态", icon: Users },
          { href: "/admin/transactions", label: "Credits 流水", description: "核对消耗、退款和赠送记录", icon: ReceiptText },
          { href: "/admin/tasks", label: "生成任务", description: "定位失败任务和供应商状态", icon: ClipboardList },
          { href: "/admin/models", label: "模型目录", description: "查看当前启用模型与供应商", icon: Boxes },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link href={item.href} key={item.href} className="admin-quick-card">
              <span className="admin-quick-card__icon"><Icon size={18} /></span>
              <span className="admin-quick-card__copy"><strong>{item.label}</strong><small>{item.description}</small></span>
              <ArrowUpRight className="admin-quick-card__arrow" size={17} />
            </Link>
          );
        })}
      </section>

      <section className="admin-notice">
        <div className="admin-notice__marker" />
        <div>
          <strong>支付系统尚未接入</strong>
          <p>当前价格页仍是展示页面。Creem Checkout、支付 Webhook、订单和退款会在阶段 2、3 开发。</p>
        </div>
        <span className="admin-notice__tag">PLANNED</span>
      </section>
    </div>
  );
}
