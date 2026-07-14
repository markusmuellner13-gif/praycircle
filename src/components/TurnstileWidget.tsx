"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          theme?: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
        }
      ) => string;
    };
    __praycircleTurnstileReady?: () => void;
  }
}

const SCRIPT_ID = "cf-turnstile-script";

export default function TurnstileWidget({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    const renderWidget = () => {
      if (renderedRef.current || !containerRef.current || !window.turnstile) return;
      renderedRef.current = true;
      window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(null),
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }
    window.__praycircleTurnstileReady = renderWidget;
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__praycircleTurnstileReady";
      script.async = true;
      document.head.appendChild(script);
    }
  }, [siteKey, onToken]);

  return <div ref={containerRef} style={{ margin: "6px 0 14px" }} />;
}
