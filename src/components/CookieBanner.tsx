"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "./AppProvider";

const KEY = "praycircle_cookie_notice";

export default function CookieBanner() {
  const { t } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true);
  }, []);

  if (!visible) return null;
  return (
    <div className="cookie-banner" role="dialog" aria-live="polite">
      <p>
        🍪 {t.cookieBanner} <Link href="/cookies">{t.learnMore}</Link>
      </p>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => {
          localStorage.setItem(KEY, String(Date.now()));
          setVisible(false);
        }}
      >
        {t.cookieOk}
      </button>
    </div>
  );
}
