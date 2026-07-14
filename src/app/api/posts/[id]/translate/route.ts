import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { translateText } from "@/lib/translate";
import type { Lang } from "@/lib/prayerEngine";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const target: Lang = ["en", "de", "it"].includes(body.language)
      ? body.language
      : "en";

    const db = await getDb();
    const postResult = await db.execute({
      sql: "SELECT content, language FROM posts WHERE id = ?",
      args: [id],
    });
    if (postResult.rows.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const content = String(postResult.rows[0].content);
    const sourceLang = String(postResult.rows[0].language);
    if (sourceLang === target) {
      return NextResponse.json({ translation: content });
    }

    const cached = await db.execute({
      sql: "SELECT text FROM translations WHERE post_id = ? AND language = ?",
      args: [id, target],
    });
    if (cached.rows.length > 0) {
      return NextResponse.json({ translation: String(cached.rows[0].text) });
    }

    const translation = await translateText(content, sourceLang, target);
    if (!translation) {
      return NextResponse.json({ error: "translate_failed" }, { status: 502 });
    }
    await db.execute({
      sql: "INSERT OR REPLACE INTO translations (post_id, language, text) VALUES (?, ?, ?)",
      args: [id, target, translation],
    });
    return NextResponse.json({ translation });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
