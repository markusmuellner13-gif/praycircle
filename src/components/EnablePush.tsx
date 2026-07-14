"use client";

import { useEffect, useState } from "react";
import { useApp } from "./AppProvider";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

type State = "unsupported" | "idle" | "busy" | "enabled" | "denied";

export default function EnablePush() {
  const { user, t } = useApp();
  const [state, setState] = useState<State>("unsupported");

  useEffect(() => {
    if (!user) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "enabled" : "idle"))
      .catch(() => setState("idle"));
  }, [user]);

  if (!user || state === "unsupported") return null;

  const enable = async () => {
    setState("busy");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "idle");
        return;
      }
      const keyResponse = await fetch("/api/push");
      if (!keyResponse.ok) throw new Error();
      const { key } = await keyResponse.json();
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });
      const saved = await fetch("/api/push", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!saved.ok) throw new Error();
      setState("enabled");
    } catch {
      setState("idle");
    }
  };

  if (state === "enabled") {
    return <p className="push-status">✅ {t.pushEnabled}</p>;
  }
  if (state === "denied") {
    return <p className="push-status">🔕 {t.pushDenied}</p>;
  }
  return (
    <button
      className="btn btn-ghost btn-sm"
      onClick={enable}
      disabled={state === "busy"}
    >
      🔔 {state === "busy" ? t.loading : t.enablePush}
    </button>
  );
}
