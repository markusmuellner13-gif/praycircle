"use client";

import { useEffect, useState } from "react";
import { useApp } from "./AppProvider";

interface Props {
  postId: string;
  intention: string;
  onAmen: (newCount: number) => void;
  onClose: () => void;
}

export default function PrayerModal({ postId, intention, onAmen, onClose }: Props) {
  const { lang, t } = useApp();
  const [prayer, setPrayer] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [sealing, setSealing] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/posts/${postId}/pray`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ language: lang }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (active) setPrayer(data.prayer);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [postId, lang]);

  const sealWithAmen = async () => {
    setSealing(true);
    try {
      const response = await fetch(`/api/posts/${postId}/amen`, {
        method: "POST",
      });
      const data = response.ok ? await response.json() : null;
      onAmen(data?.prayerCount ?? -1);
    } catch {
      onAmen(-1);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="candle">🕯️</div>
        <h2>{t.aPrayerFor}</h2>
        <p className="intention-quote">“{intention}”</p>
        {error ? (
          <>
            <p className="prayer-text">{t.error}</p>
            <button className="btn btn-ghost" onClick={onClose}>
              {t.close}
            </button>
          </>
        ) : prayer ? (
          <>
            <div className="prayer-text">{prayer}</div>
            <button
              className="btn btn-gold amen-btn"
              onClick={sealWithAmen}
              disabled={sealing}
            >
              🙏 {t.amen}
            </button>
          </>
        ) : (
          <div style={{ padding: "30px 0" }}>
            <div className="spinner" />
            <p style={{ marginTop: 12, color: "var(--text-dim)", fontSize: "0.88rem" }}>
              {t.preparingPrayer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
