import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb } from "./db";

const COOKIE_NAME = "praycircle_session";
const SESSION_DAYS = 30;

function getSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET || "praycircle-dev-secret-do-not-use-in-prod";
  return new TextEncoder().encode(secret);
}

export interface SessionUser {
  id: string;
  username: string;
  language: string;
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({
    sub: user.id,
    username: user.username,
    language: user.language,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      username: String(payload.username || ""),
      language: String(payload.language || "en"),
    };
  } catch {
    return null;
  }
}

/** Session that is also verified to still exist in the database
 *  (so deleted accounts are locked out immediately). */
export async function getVerifiedUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT id, username, language FROM users WHERE id = ?",
    args: [session.id],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: String(row.id),
    username: String(row.username),
    language: String(row.language),
  };
}
