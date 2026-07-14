"use client";

import Link from "next/link";
import { useApp } from "./AppProvider";

export default function Footer() {
  const { t } = useApp();
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} PrayCircle</span>
      <Link href="/privacy">{t.privacy}</Link>
      <Link href="/terms">{t.terms}</Link>
      <Link href="/cookies">{t.cookies}</Link>
    </footer>
  );
}
