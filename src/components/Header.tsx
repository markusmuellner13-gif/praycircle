"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { useApp } from "./AppProvider";

export default function Header() {
  const { user, lang, cycleLang, t } = useApp();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    let active = true;
    const load = () =>
      fetch("/api/notifications")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (active && data) setUnread(data.unread ?? 0);
        })
        .catch(() => {});
    load();
    const interval = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="brand">
          <Logo size={26} />
          PrayCircle
        </Link>
        <div className="header-actions">
          <button
            className="lang-btn"
            onClick={cycleLang}
            title={t.languageLabel}
            aria-label={t.languageLabel}
          >
            {lang.toUpperCase()}
          </button>
          {user && (
            <Link
              href="/notifications"
              className="icon-btn"
              title={t.notifications}
              aria-label={t.notifications}
            >
              🔔
              {unread > 0 && (
                <span className="badge">{unread > 9 ? "9+" : unread}</span>
              )}
            </Link>
          )}
          {user ? (
            <Link
              href="/account"
              className="icon-btn"
              title={t.account}
              aria-label={t.account}
            >
              👤
            </Link>
          ) : (
            <Link href="/login" className="btn btn-ghost btn-sm">
              {t.signIn}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
