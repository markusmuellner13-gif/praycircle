"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "./AppProvider";
import { MAX_POST_LENGTH } from "@/lib/moderation";
import type { Post } from "./PostCard";

export default function Composer({ onCreated }: { onCreated: (post: Post) => void }) {
  const { user, lang, t } = useApp();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_POST_LENGTH - content.length;

  const submit = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setPosting(true);
    setError(null);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: content.trim(), language: lang }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.error === "moderation") {
          const reasons: Record<string, string> = {
            too_short: t.modTooShort,
            too_long: t.modTooLong,
            blocked: t.modBlocked,
            spam: t.modSpam,
          };
          setError(reasons[data.reason] ?? t.error);
        } else if (data.error === "unauthorized") {
          router.push("/login");
        } else if (data.error === "rate_limited") {
          setError(t.rateLimited);
        } else {
          setError(t.error);
        }
        return;
      }
      setContent("");
      onCreated(data.post);
    } catch {
      setError(t.error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="composer">
      <textarea
        rows={2}
        maxLength={MAX_POST_LENGTH + 20}
        placeholder={user ? t.createPlaceholder : t.signInToPost}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => {
          if (!user) router.push("/login");
        }}
      />
      {error && <p className="form-error" style={{ marginTop: 10 }}>{error}</p>}
      <div className="composer-footer">
        <span className={`char-count${remaining < 0 ? " over" : ""}`}>
          {remaining} {t.charsLeft}
        </span>
        <button
          className="btn btn-gold btn-sm"
          onClick={submit}
          disabled={posting || content.trim().length === 0 || remaining < 0}
        >
          {posting ? t.posting : `✝ ${t.post}`}
        </button>
      </div>
    </div>
  );
}
