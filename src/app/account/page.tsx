"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { LANGS, LANG_LABELS, type Lang } from "@/lib/i18n";
import PostCard, { type Post } from "@/components/PostCard";
import EnablePush from "@/components/EnablePush";

export default function AccountPage() {
  const { user, setUser, lang, setLang, t, ready } = useApp();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [myPosts, setMyPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetch("/api/posts?mine=1")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setMyPosts(data.posts))
      .catch(() => setMyPosts([]));
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="empty-state">
        <div className="spinner" />
      </div>
    );
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
        <div className="field">
          <label>{t.notifications}</label>
          <EnablePush />
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

      <h2 className="page-title" style={{ fontSize: "1.15rem" }}>
        {t.yourIntentions}
      </h2>
      {myPosts === null ? (
        <div className="empty-state">
          <div className="spinner" />
        </div>
      ) : myPosts.length === 0 ? (
        <div className="empty-state">🕊️ {t.noPostsYet}</div>
      ) : (
        myPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDeleted={(id) =>
              setMyPosts((prev) => (prev ? prev.filter((p) => p.id !== id) : prev))
            }
          />
        ))
      )}

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
