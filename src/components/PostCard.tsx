"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "./AppProvider";
import PrayerModal from "./PrayerModal";

export interface Post {
  id: string;
  content: string;
  language: string;
  prayerCount: number;
  createdAt: number;
  userId: string;
  username: string;
}

function timeAgo(
  timestamp: number,
  t: { justNow: string; minAgo: string; hoursAgo: string; daysAgo: string }
): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return t.justNow;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${t.minAgo}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${t.hoursAgo}`;
  return `${Math.floor(hours / 24)} ${t.daysAgo}`;
}

export default function PostCard({
  post,
  onDeleted,
}: {
  post: Post;
  onDeleted?: (id: string) => void;
}) {
  const { user, lang, t } = useApp();
  const router = useRouter();
  const [praying, setPraying] = useState(false);
  const [count, setCount] = useState(post.prayerCount);
  const [translation, setTranslation] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isMine = user?.id === post.userId;
  const foreignLanguage = post.language !== lang;

  const handlePray = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setPraying(true);
  };

  const handleTranslate = async () => {
    if (translation) {
      setShowTranslation(!showTranslation);
      return;
    }
    setTranslating(true);
    setTranslateError(false);
    try {
      const response = await fetch(`/api/posts/${post.id}/translate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language: lang }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setTranslation(data.translation);
      setShowTranslation(true);
    } catch {
      setTranslateError(true);
    } finally {
      setTranslating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`${t.deletePost}?`)) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (response.ok) onDeleted?.(post.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="card">
      <div className="post-meta">
        <span className="username">@{post.username}</span>
        <span>·</span>
        <span>{timeAgo(post.createdAt, t)}</span>
        {isMine && (
          <>
            <span style={{ marginLeft: "auto" }} />
            <button className="link-btn" onClick={handleDelete} disabled={deleting}>
              {t.deletePost}
            </button>
          </>
        )}
      </div>
      <p className="post-content">
        {showTranslation && translation ? translation : post.content}
      </p>
      {showTranslation && translation && (
        <p className="translated-note">🌐 {lang.toUpperCase()}</p>
      )}
      {translateError && <p className="translated-note">{t.translateFailed}</p>}
      <div className="post-actions">
        <button className="btn btn-ghost btn-sm" onClick={handlePray}>
          🙏 {t.pray}
        </button>
        {foreignLanguage && (
          <button className="link-btn" onClick={handleTranslate} disabled={translating}>
            {translating
              ? t.translating
              : showTranslation
                ? t.showOriginal
                : t.translate}
          </button>
        )}
        <span className="pray-count">
          🕯️ {count} {count === 1 ? t.prayers_one : t.prayers_other}
        </span>
      </div>
      {praying && (
        <PrayerModal
          postId={post.id}
          intention={post.content}
          onAmen={(newCount) => {
            if (newCount >= 0) setCount(newCount);
            else setCount((c) => c + 1);
            setPraying(false);
          }}
          onClose={() => setPraying(false)}
        />
      )}
    </article>
  );
}
