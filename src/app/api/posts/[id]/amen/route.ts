import { NextResponse } from "next/server";
import { after } from "next/server";
import { getDb, newId } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/ratelimit";
import { sendPushToUser } from "@/lib/push";

export const dynamic = "force-dynamic";

const PUSH_BODY: Record<string, string> = {
  en: "Someone prayed for your intention",
  de: "Jemand hat für dein Anliegen gebetet",
  it: "Qualcuno ha pregato per la tua intenzione",
};

/** Seals the prayer: increments the counter and notifies the author. */
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
      `amen:${session.id}`,
      60,
      60 * 60 * 1000
    );
    if (!allowed) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const postResult = await db.execute({
      sql: "SELECT id, user_id, content FROM posts WHERE id = ?",
      args: [id],
    });
    if (postResult.rows.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const post = postResult.rows[0];

    await db.execute({
      sql: "UPDATE posts SET prayer_count = prayer_count + 1 WHERE id = ?",
      args: [id],
    });

    // Notify the author (unless they prayed for their own intention).
    const authorId = String(post.user_id);
    if (authorId !== session.id) {
      const excerpt = String(post.content).slice(0, 80);
      await db.execute({
        sql: "INSERT INTO notifications (id, user_id, post_id, post_excerpt, type, read, created_at) VALUES (?, ?, ?, ?, 'prayed', 0, ?)",
        args: [newId(), authorId, id, excerpt, Date.now()],
      });

      // Web push, in the author's language.
      after(async () => {
        try {
          const author = await db.execute({
            sql: "SELECT language FROM users WHERE id = ?",
            args: [authorId],
          });
          const lang = String(author.rows[0]?.language ?? "en");
          await sendPushToUser(db, authorId, {
            title: "PrayCircle 🙏",
            body: `${PUSH_BODY[lang] ?? PUSH_BODY.en}: “${excerpt}”`,
            url: "/notifications",
          });
        } catch {
          // In-app notification already stored; push is best-effort.
        }
      });
    }

    const countResult = await db.execute({
      sql: "SELECT prayer_count FROM posts WHERE id = ?",
      args: [id],
    });
    return NextResponse.json({
      ok: true,
      prayerCount: Number(countResult.rows[0]?.prayer_count ?? 0),
    });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
