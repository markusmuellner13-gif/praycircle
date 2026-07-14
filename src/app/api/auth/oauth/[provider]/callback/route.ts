import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb, newId } from "@/lib/db";
import { createSession } from "@/lib/auth";
import {
  exchangeCode,
  providerEnabled,
  type Provider,
} from "@/lib/oauth";

export const dynamic = "force-dynamic";

function failRedirect(origin: string): NextResponse {
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}

async function generateUsername(
  db: Awaited<ReturnType<typeof getDb>>,
  email: string | null,
  name: string | null
): Promise<string> {
  let base = (email?.split("@")[0] || name || "pilgrim")
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "")
    .slice(0, 14);
  if (base.length < 3 || base.includes("praycircle")) base = "pilgrim";
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate =
      attempt === 0 ? base : `${base}${Math.floor(1000 + Math.random() * 9000)}`;
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE username = ?",
      args: [candidate],
    });
    if (existing.rows.length === 0) return candidate;
  }
  return `pilgrim${newId().slice(0, 8)}`;
}

async function handleCallback(
  request: Request,
  provider: string,
  code: string | null,
  state: string | null
): Promise<NextResponse> {
  const origin = new URL(request.url).origin;
  if (provider !== "google" && provider !== "apple") {
    return failRedirect(origin);
  }
  if (!providerEnabled(provider as Provider) || !code || !state) {
    return failRedirect(origin);
  }
  const store = await cookies();
  const expectedState = store.get("praycircle_oauth_state")?.value;
  store.delete("praycircle_oauth_state");
  if (!expectedState || expectedState !== state) {
    return failRedirect(origin);
  }

  const identity = await exchangeCode(provider as Provider, code, origin);
  if (!identity) return failRedirect(origin);

  const db = await getDb();

  // 1. Existing link for this provider identity?
  let userRow = (
    await db.execute({
      sql: "SELECT id, username, language FROM users WHERE provider_sub = ?",
      args: [identity.sub],
    })
  ).rows[0];

  // 2. Existing account with the same verified email? Link it.
  if (!userRow && identity.email && identity.emailVerified) {
    const byEmail = await db.execute({
      sql: "SELECT id, username, language FROM users WHERE email = ?",
      args: [identity.email.toLowerCase()],
    });
    if (byEmail.rows.length > 0) {
      userRow = byEmail.rows[0];
      await db.execute({
        sql: "UPDATE users SET provider_sub = ? WHERE id = ?",
        args: [identity.sub, String(userRow.id)],
      });
    }
  }

  // 3. Brand-new account.
  if (!userRow) {
    if (!identity.email || !identity.emailVerified) return failRedirect(origin);
    const id = newId();
    const username = await generateUsername(db, identity.email, identity.name);
    try {
      await db.execute({
        sql: `INSERT INTO users (id, username, email, password_hash, language, created_at, official, auth_provider, provider_sub)
              VALUES (?, ?, ?, '!', 'en', ?, 0, ?, ?)`,
        args: [
          id,
          username,
          identity.email.toLowerCase(),
          Date.now(),
          provider,
          identity.sub,
        ],
      });
    } catch {
      return failRedirect(origin);
    }
    userRow = { id, username, language: "en" } as never;
  }

  await createSession({
    id: String(userRow.id),
    username: String(userRow.username),
    language: String(userRow.language),
  });
  return NextResponse.redirect(`${origin}/`);
}

/** Google returns via GET redirect. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const url = new URL(request.url);
  return handleCallback(
    request,
    provider,
    url.searchParams.get("code"),
    url.searchParams.get("state")
  );
}

/** Apple returns via cross-site form POST (response_mode=form_post). */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const form = await request.formData().catch(() => null);
  return handleCallback(
    request,
    provider,
    form ? String(form.get("code") ?? "") || null : null,
    form ? String(form.get("state") ?? "") || null : null
  );
}
