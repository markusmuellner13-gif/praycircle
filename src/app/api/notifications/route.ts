import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const db = await getDb();
    const result = await db.execute({
      sql: `SELECT id, post_id, post_excerpt, type, read, created_at
            FROM notifications WHERE user_id = ?
            ORDER BY created_at DESC LIMIT 50`,
      args: [session.id],
    });
    const notifications = result.rows.map((row) => ({
      id: String(row.id),
      postId: row.post_id ? String(row.post_id) : null,
      postExcerpt: String(row.post_excerpt),
      type: String(row.type),
      read: Number(row.read) === 1,
      createdAt: Number(row.created_at),
    }));
    const unread = notifications.filter((n) => !n.read).length;
    return NextResponse.json({ notifications, unread });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

/** Mark all notifications as read. */
export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const db = await getDb();
    await db.execute({
      sql: "UPDATE notifications SET read = 1 WHERE user_id = ?",
      args: [session.id],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
