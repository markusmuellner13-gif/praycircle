"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { LANGS, LANG_LABELS, type Lang } from "@/lib/i18n";

export default function AccountPage() {
  const { user, setUser, lang, setLang, t, ready } = useApp();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!ready) {
    return (
      <div className="empty-state">
        <div className="spinner" />
      </div>
    );
  }
  if (!user) {
    router.push("/login");
    return null;
  }

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  const deleteAccount = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/account", { method: "DELETE" });
      if (response.ok) {
        setUser(null);
        router.push("/");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="page-title">{t.accountTitle}</h1>
      <div className="card">
        <div className="post-meta">
          <span className="username">@{user.username}</span>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label>{t.languageLabel}</label>
          <div style={{ display: "flex", gap: 8 }}>
            {LANGS.map((code) => (
              <button
                key={code}
                className={`btn btn-sm ${lang === code ? "btn-gold" : "btn-ghost"}`}
                onClick={() => setLang(code as Lang)}
              >
                {LANG_LABELS[code]}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button className="btn btn-ghost btn-sm" onClick={signOut}>
            {t.signOut}
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setConfirming(true)}
          >
            {t.deleteAccount}
          </button>
        </div>
      </div>

      {confirming && (
        <div className="overlay" onClick={() => setConfirming(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t.deleteAccount}</h2>
            <p
              style={{
                color: "var(--text-dim)",
                fontSize: "0.9rem",
                margin: "12px 0 20px",
              }}
            >
              {t.deleteWarning}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                className="btn btn-ghost"
                onClick={() => setConfirming(false)}
              >
                {t.cancel}
              </button>
              <button
                className="btn btn-danger"
                onClick={deleteAccount}
                disabled={busy}
              >
                {busy ? t.loading : t.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
