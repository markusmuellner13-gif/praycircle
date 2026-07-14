import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const db = await getDb();
    const result = await db.execute({
      sql: "SELECT id, username, password_hash, language FROM users WHERE email = ?",
      args: [email],
    });
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }
    const row = result.rows[0];
    const ok = await bcrypt.compare(password, String(row.password_hash));
    if (!ok) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const user = {
      id: String(row.id),
      username: String(row.username),
      language: String(row.language),
    };
    await createSession(user);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
