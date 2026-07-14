"use client";

import { useCallback, useEffect, useState } from "react";
import { useApp } from "./AppProvider";
import PostCard, { type Post } from "./PostCard";
import Composer from "./Composer";

export default function Feed() {
  const { t } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async (before?: number) => {
    try {
      const query = before ? `?before=${before}` : "";
      const response = await fetch(`/api/posts${query}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setPosts((prev) => (before ? [...prev, ...data.posts] : data.posts));
      setHasMore(data.hasMore);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const loadMore = async () => {
    if (posts.length === 0) return;
    setLoadingMore(true);
    await load(posts[posts.length - 1].createdAt);
    setLoadingMore(false);
  };

  return (
    <>
      <Composer onCreated={(post) => setPosts((prev) => [post, ...prev])} />
      {loading ? (
        <div className="empty-state">
          <div className="spinner" />
        </div>
      ) : failed ? (
        <div className="empty-state">{t.error}</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">🕊️ {t.emptyFeed}</div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDeleted={(id) =>
                setPosts((prev) => prev.filter((p) => p.id !== id))
              }
            />
          ))}
          {hasMore && (
            <div style={{ textAlign: "center", marginTop: 18 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? t.loading : t.loadMore}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
