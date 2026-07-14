/**
 * Cloudflare Turnstile verification (optional bot protection).
 * Activates when TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY are set.
 */

export function turnstileSiteKey(): string | null {
  return process.env.TURNSTILE_SITE_KEY || null;
}

export async function verifyTurnstile(
  token: string | undefined,
  ip: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured — nothing to enforce
  if (!token) return false;
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: token,
          remoteip: ip,
        }),
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!response.ok) return false;
    const data = await response.json();
    return data?.success === true;
  } catch {
    return false;
  }
}
