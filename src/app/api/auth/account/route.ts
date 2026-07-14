import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession, destroySession, createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Update account settings (currently: preferred language). */
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const language = ["en", "de", "it"].includes(body.language)
    ? body.language
    : null;
  if (!language) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const db = await getDb();
  await db.execute({
    sql: "UPDATE users SET language = ? WHERE id = ?",
    args: [language, session.id],
  });
  await createSession({ ...session, language });
  return NextResponse.json({ ok: true });
}

/** Permanently delete the account and everything attached to it. */
export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = await getDb();
  const posts = await db.execute({
    sql: "SELECT id FROM posts WHERE user_id = ?",
    args: [session.id],
  });
  for (const row of posts.rows) {
    const postId = String(row.id);
    await db.execute({
      sql: "DELETE FROM generated_prayers WHERE post_id = ?",
      args: [postId],
    });
    await db.execute({
      sql: "DELETE FROM translations WHERE post_id = ?",
      args: [postId],
    });
    await db.execute({
      sql: "DELETE FROM notifications WHERE post_id = ?",
      args: [postId],
    });
  }
  await db.execute({
    sql: "DELETE FROM posts WHERE user_id = ?",
    args: [session.id],
  });
  await db.execute({
    sql: "DELETE FROM notifications WHERE user_id = ?",
    args: [session.id],
  });
  await db.execute({
    sql: "DELETE FROM push_subscriptions WHERE user_id = ?",
    args: [session.id],
  });
  await db.execute({
    sql: "DELETE FROM reports WHERE user_id = ?",
    args: [session.id],
  });
  await db.execute({
    sql: "DELETE FROM users WHERE id = ?",
    args: [session.id],
  });
  await destroySession();
  return NextResponse.json({ ok: true });
}
