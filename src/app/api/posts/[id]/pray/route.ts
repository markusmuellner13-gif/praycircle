import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  composePrayer,
  detectCategory,
  generatePrayerWithAI,
  type Category,
  type Lang,
} from "@/lib/prayerEngine";

export const dynamic = "force-dynamic";

/** Returns a prayer fitting this intention, in the reader's language. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const lang: Lang = ["en", "de", "it"].includes(body.language)
      ? body.language
      : "en";

    const db = await getDb();
    const postResult = await db.execute({
      sql: "SELECT id, content, category FROM posts WHERE id = ?",
      args: [id],
    });
    if (postResult.rows.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const post = postResult.rows[0];

    // Cached?
    const cached = await db.execute({
      sql: "SELECT text FROM generated_prayers WHERE post_id = ? AND language = ?",
      args: [id, lang],
    });
    if (cached.rows.length > 0) {
      return NextResponse.json({ prayer: String(cached.rows[0].text) });
    }

    const content = String(post.content);
    let prayer = await generatePrayerWithAI(content, lang);
    if (!prayer) {
      const category = (String(post.category) || detectCategory(content)) as Category;
      prayer = composePrayer(category, lang, id);
    }

    await db.execute({
      sql: "INSERT OR REPLACE INTO generated_prayers (post_id, language, text, created_at) VALUES (?, ?, ?, ?)",
      args: [id, lang, prayer, Date.now()],
    });
    return NextResponse.json({ prayer });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
