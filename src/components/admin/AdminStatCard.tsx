import type { LucideIcon } from "lucide-react";

export default function AdminStatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = "amber",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  accent?: "amber" | "blue" | "green" | "red";
}) {
  return (
    <article className={`admin-stat-card admin-stat-card--${accent}`}>
      <div className="admin-stat-card__topline">
        <span>{label}</span>
        <span className="admin-stat-card__icon"><Icon size={17} /></span>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}
