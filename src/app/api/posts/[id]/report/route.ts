import { NextResponse } from "next/server";
import { getDb, newId } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/** Number of distinct reporters after which a post is hidden pending review. */
const AUTO_HIDE_THRESHOLD = 3;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const db = await getDb();

    const allowed = await checkRateLimit(
      db,
      `report:${session.id}`,
      10,
      60 * 60 * 1000
    );
    if (!allowed) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const postResult = await db.execute({
      sql: "SELECT id FROM posts WHERE id = ?",
      args: [id],
    });
    if (postResult.rows.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    try {
      await db.execute({
        sql: "INSERT INTO reports (id, post_id, user_id, created_at) VALUES (?, ?, ?, ?)",
        args: [newId(), id, session.id, Date.now()],
      });
    } catch {
      // Unique index: this user already reported this post.
      return NextResponse.json({ ok: true, already: true });
    }

    const countResult = await db.execute({
      sql: "SELECT COUNT(*) AS n FROM reports WHERE post_id = ?",
      args: [id],
    });
    if (Number(countResult.rows[0].n) >= AUTO_HIDE_THRESHOLD) {
      await db.execute({
        sql: "UPDATE posts SET hidden = 1 WHERE id = ?",
        args: [id],
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
