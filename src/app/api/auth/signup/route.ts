import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, newId } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { validateUsername } from "@/lib/moderation";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const language = ["en", "de", "it"].includes(body.language)
      ? body.language
      : "en";

    const username = validateUsername(String(body.username || ""));
    if (!username) {
      return NextResponse.json({ error: "username_invalid" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: "email_invalid" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "password_short" }, { status: 400 });
    }

    // Cloudflare Turnstile bot check (no-op unless configured).
    const human = await verifyTurnstile(
      typeof body.turnstileToken === "string" ? body.turnstileToken : undefined,
      clientIp(request)
    );
    if (!human) {
      return NextResponse.json({ error: "turnstile" }, { status: 403 });
    }

    const db = await getDb();

    const allowed = await checkRateLimit(
      db,
      `signup:${clientIp(request)}`,
      5,
      60 * 60 * 1000
    );
    if (!allowed) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const existingUsername = await db.execute({
      sql: "SELECT id FROM users WHERE username = ?",
      args: [username],
    });
    if (existingUsername.rows.length > 0) {
      return NextResponse.json({ error: "username_taken" }, { status: 409 });
    }
    const existingEmail = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });
    if (existingEmail.rows.length > 0) {
      return NextResponse.json({ error: "email_taken" }, { status: 409 });
    }

    const id = newId();
    const passwordHash = await bcrypt.hash(password, 10);
    try {
      await db.execute({
        sql: "INSERT INTO users (id, username, email, password_hash, language, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        args: [id, username, email, passwordHash, language, Date.now()],
      });
    } catch {
      // Unique index race: someone claimed the name between check and insert.
      return NextResponse.json({ error: "username_taken" }, { status: 409 });
    }

    await createSession({ id, username, language });
    return NextResponse.json({ user: { id, username, language } });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
