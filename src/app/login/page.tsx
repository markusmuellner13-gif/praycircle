"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";

export default function LoginPage() {
  const { t, setUser } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error === "invalid_credentials" ? t.invalidCredentials : t.error);
        return;
      }
      setUser(data.user);
      router.push("/");
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>{t.signIn}</h1>
      <p className="sub">{t.welcomeBack} 🙏</p>
      {error && <p className="form-error">{error}</p>}
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">{t.email}</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">{t.password}</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn btn-gold btn-block" disabled={busy}>
          {busy ? t.loading : t.signIn}
        </button>
      </form>
      <p className="auth-switch">
        {t.noAccount} <Link href="/signup">{t.signUp}</Link>
      </p>
    </div>
  );
}
