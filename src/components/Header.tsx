"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useApp } from "./AppProvider";

export default function Header() {
  const { lang, cycleLang, t } = useApp();

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
        </div>
      </div>
    </header>
  );
}
