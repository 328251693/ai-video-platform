"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { ArrowUpRight, Clapperboard, CreditCard, FolderOpen, LogOut, UserRound } from "lucide-react";

const navItems = [
  { href: "/generate", label: "创作", icon: Clapperboard },
  { href: "/history", label: "素材", icon: FolderOpen },
  { href: "/pricing", label: "订阅", icon: CreditCard },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      setLoading(false);
    });

    const { data: authState } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      authState.subscription.unsubscribe();
    };
  }, [supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="回到首页">
          <span className="brand__mark"><Clapperboard size={16} strokeWidth={2.5} /></span>
          <span>FrameForge</span>
        </Link>

        <nav className="site-nav" aria-label="主导航">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href === "/generate" && pathname.startsWith("/generate"));
            return (
              <Link key={item.href} href={item.href} className={`site-nav__link ${active ? "is-active" : ""}`}>
                <Icon size={15} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="site-header__actions">
          {!loading && user && (
            <Link href="/account" className="credit-pill" title="查看账户与 Credits">
              <span className="credit-pill__dot" />
              <span>Credits</span>
              <span className="credit-pill__value">账户</span>
            </Link>
          )}
          {!loading && user ? (
            <div className="user-menu">
              <Link href="/account" className="avatar-button" aria-label="打开账户">
                {user.user_metadata?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.user_metadata.avatar_url} alt="" />
                ) : (
                  <UserRound size={16} />
                )}
              </Link>
              <button type="button" className="icon-button" onClick={logout} aria-label="退出登录" title="退出登录">
                <LogOut size={16} />
              </button>
            </div>
          ) : !loading ? (
            <Link href="/login" className="header-login">
              登录 <ArrowUpRight size={15} />
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
