"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import { pickPhrase } from "@/lib/phrases";
import { useApp } from "./AppProvider";
import type { Lang } from "@/lib/i18n";

const LAST_PHRASE_KEY = "praycircle_last_phrase";

export default function SplashScreen() {
  const { lang } = useApp();
  const [phrase, setPhrase] = useState("");
  const [hiding, setHiding] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const previous = localStorage.getItem(LAST_PHRASE_KEY);
    const next = pickPhrase(lang as Lang, previous);
    localStorage.setItem(LAST_PHRASE_KEY, next);
    setPhrase(next);

    const hideTimer = setTimeout(() => setHiding(true), 1500);
    const goneTimer = setTimeout(() => setGone(true), 2100);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(goneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;
  return (
    <div className={`splash${hiding ? " hiding" : ""}`}>
      <Logo size={72} glow />
      <div className="splash-name">PrayCircle</div>
      <div className="splash-phrase">{phrase}</div>
    </div>
  );
}
