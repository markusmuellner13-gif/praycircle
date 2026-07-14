"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./AppProvider";

export default function BottomNav() {
  const { user, t, unread } = useApp();
  const pathname = usePathname();

  const tabs = [
    { href: "/", icon: "🏠", label: t.navHome },
    { href: "/create", icon: "✚", label: t.navCreate },
    { href: "/notifications", icon: "🔔", label: t.notifications, badge: unread },
    {
      href: user ? "/account" : "/login",
      icon: "👤",
      label: user ? t.account : t.signIn,
    },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`bottom-nav-item${pathname === tab.href ? " active" : ""}`}
        >
          <span className="bottom-nav-icon">
            {tab.icon}
            {tab.badge ? (
              <span className="badge">{tab.badge > 9 ? "9+" : tab.badge}</span>
            ) : null}
          </span>
          <span className="bottom-nav-label">{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}
