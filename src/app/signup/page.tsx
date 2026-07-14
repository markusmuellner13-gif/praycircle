"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";

export default function SignupPage() {
  const { t, lang, setUser } = useApp();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, email, password, language: lang }),
      });
      const data = await response.json();
      if (!response.ok) {
        const messages: Record<string, string> = {
          username_taken: t.usernameTaken,
          username_invalid: t.usernameInvalid,
          email_taken: t.emailTaken,
          password_short: t.passwordTooShort,
        };
        setError(messages[data.error] ?? t.error);
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
      <h1>{t.signUp}</h1>
      <p className="sub">{t.joinCircle} ✝</p>
      {error && <p className="form-error">{error}</p>}
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="username">{t.username}</label>
          <input
            id="username"
            required
            minLength={3}
            maxLength={20}
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <p className="hint">{t.usernameHint}</p>
        </div>
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
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn btn-gold btn-block" disabled={busy}>
          {busy ? t.loading : t.createAccount}
        </button>
      </form>
      <p className="auth-switch">
        {t.haveAccount} <Link href="/login">{t.signIn}</Link>
      </p>
    </div>
  );
}
