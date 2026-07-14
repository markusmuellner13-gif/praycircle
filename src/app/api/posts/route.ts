import { NextResponse } from "next/server";
import { getDb, newId } from "@/lib/db";
import { getVerifiedUser } from "@/lib/auth";
import { moderatePost } from "@/lib/moderation";
import { detectCategory } from "@/lib/prayerEngine";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const before = Number(searchParams.get("before")) || Date.now() + 1;
    const db = await getDb();
    const result = await db.execute({
      sql: `SELECT p.id, p.content, p.language, p.prayer_count, p.created_at, p.user_id, u.username
            FROM posts p JOIN users u ON u.id = p.user_id
            WHERE p.created_at < ?
            ORDER BY p.created_at DESC
            LIMIT ?`,
      args: [before, PAGE_SIZE],
    });
    const posts = result.rows.map((row) => ({
      id: String(row.id),
      content: String(row.content),
      language: String(row.language),
      prayerCount: Number(row.prayer_count),
      createdAt: Number(row.created_at),
      userId: String(row.user_id),
      username: String(row.username),
    }));
    return NextResponse.json({
      posts,
      hasMore: posts.length === PAGE_SIZE,
    });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getVerifiedUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const content = String(body.content || "").trim();
    const language = ["en", "de", "it"].includes(body.language)
      ? body.language
      : "en";

    const moderation = moderatePost(content);
    if (!moderation.ok) {
      return NextResponse.json(
        { error: "moderation", reason: moderation.reason },
        { status: 422 }
      );
    }

    const db = await getDb();
    const id = newId();
    const createdAt = Date.now();
    await db.execute({
      sql: "INSERT INTO posts (id, user_id, content, language, category, prayer_count, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)",
      args: [id, user.id, content, language, detectCategory(content), createdAt],
    });
    return NextResponse.json({
      post: {
        id,
        content,
        language,
        prayerCount: 0,
        createdAt,
        userId: user.id,
        username: user.username,
      },
    });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
