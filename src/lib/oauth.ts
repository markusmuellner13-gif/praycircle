import {
  SignJWT,
  createRemoteJWKSet,
  importPKCS8,
  jwtVerify,
} from "jose";

/**
 * Sign in with Google / Apple.
 *
 * Both providers are optional and activate automatically when their
 * environment variables are configured:
 *   Google: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   Apple:  APPLE_CLIENT_ID (Services ID), APPLE_TEAM_ID, APPLE_KEY_ID,
 *           APPLE_PRIVATE_KEY (contents of the .p8 key file)
 */

export type Provider = "google" | "apple";

export function googleEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function appleEnabled(): boolean {
  return Boolean(
    process.env.APPLE_CLIENT_ID &&
      process.env.APPLE_TEAM_ID &&
      process.env.APPLE_KEY_ID &&
      process.env.APPLE_PRIVATE_KEY
  );
}

export function providerEnabled(provider: Provider): boolean {
  return provider === "google" ? googleEnabled() : appleEnabled();
}

export function redirectUri(origin: string, provider: Provider): string {
  return `${origin}/api/auth/oauth/${provider}/callback`;
}

export function buildAuthUrl(
  provider: Provider,
  origin: string,
  state: string
): string {
  if (provider === "google") {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri(origin, "google"),
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }
  const params = new URLSearchParams({
    client_id: process.env.APPLE_CLIENT_ID!,
    redirect_uri: redirectUri(origin, "apple"),
    response_type: "code",
    scope: "email",
    response_mode: "form_post",
    state,
  });
  return `https://appleid.apple.com/auth/authorize?${params}`;
}

export interface OAuthIdentity {
  /** Globally unique, provider-prefixed subject, e.g. "google:1234…" */
  sub: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
}

const googleJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);
const appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

async function appleClientSecret(): Promise<string> {
  const key = await importPKCS8(
    process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    "ES256"
  );
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: process.env.APPLE_KEY_ID! })
    .setIssuer(process.env.APPLE_TEAM_ID!)
    .setSubject(process.env.APPLE_CLIENT_ID!)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);
}

export async function exchangeCode(
  provider: Provider,
  code: string,
  origin: string
): Promise<OAuthIdentity | null> {
  try {
    const tokenUrl =
      provider === "google"
        ? "https://oauth2.googleapis.com/token"
        : "https://appleid.apple.com/auth/token";
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(origin, provider),
      client_id:
        provider === "google"
          ? process.env.GOOGLE_CLIENT_ID!
          : process.env.APPLE_CLIENT_ID!,
      client_secret:
        provider === "google"
          ? process.env.GOOGLE_CLIENT_SECRET!
          : await appleClientSecret(),
    });
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const idToken = data?.id_token;
    if (typeof idToken !== "string") return null;

    const { payload } =
      provider === "google"
        ? await jwtVerify(idToken, googleJwks, {
            issuer: ["https://accounts.google.com", "accounts.google.com"],
            audience: process.env.GOOGLE_CLIENT_ID!,
          })
        : await jwtVerify(idToken, appleJwks, {
            issuer: "https://appleid.apple.com",
            audience: process.env.APPLE_CLIENT_ID!,
          });

    if (!payload.sub) return null;
    const email = typeof payload.email === "string" ? payload.email : null;
    const emailVerified =
      payload.email_verified === true || payload.email_verified === "true";
    return {
      sub: `${provider}:${payload.sub}`,
      email,
      // Apple only issues verified addresses.
      emailVerified: provider === "apple" ? Boolean(email) : emailVerified,
      name: typeof payload.name === "string" ? payload.name : null,
    };
  } catch {
    return null;
  }
}
