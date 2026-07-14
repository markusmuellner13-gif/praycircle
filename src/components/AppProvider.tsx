"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DICTS, LANGS, type Dict, type Lang } from "@/lib/i18n";

export interface User {
  id: string;
  username: string;
  language: string;
}

interface AppContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  cycleLang: () => void;
  t: Dict;
  ready: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export default function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLangState] = useState<Lang>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("praycircle_lang");
    if (stored && LANGS.includes(stored as Lang)) {
      setLangState(stored as Lang);
    }
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          if (
            !stored &&
            LANGS.includes(data.user.language as Lang)
          ) {
            setLangState(data.user.language as Lang);
          }
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const setLang = useCallback(
    (next: Lang) => {
      setLangState(next);
      localStorage.setItem("praycircle_lang", next);
      if (user) {
        fetch("/api/auth/account", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ language: next }),
        }).catch(() => {});
      }
    },
    [user]
  );

  const cycleLang = useCallback(() => {
    const index = LANGS.indexOf(lang);
    setLang(LANGS[(index + 1) % LANGS.length]);
  }, [lang, setLang]);

  return (
    <AppContext.Provider
      value={{ user, setUser, lang, setLang, cycleLang, t: DICTS[lang], ready }}
    >
      {children}
    </AppContext.Provider>
  );
}
