import { NextResponse } from "next/server";
import { after } from "next/server";
import { getDb, newId } from "@/lib/db";
import { getVerifiedUser } from "@/lib/auth";
import { aiModerate, moderatePost } from "@/lib/moderation";
import {
  composePrayer,
  detectCategory,
  generatePrayerWithAI,
  type Category,
  type Lang,
} from "@/lib/prayerEngine";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const LANGS: Lang[] = ["en", "de", "it"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const before = Number(searchParams.get("before")) || Date.now() + 1;
    const mine = searchParams.get("mine") === "1";
    const db = await getDb();

    let result;
    if (mine) {
      const user = await getVerifiedUser();
      if (!user) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      result = await db.execute({
        sql: `SELECT p.id, p.content, p.language, p.prayer_count, p.created_at, p.user_id, u.username
              FROM posts p JOIN users u ON u.id = p.user_id
              WHERE p.created_at < ? AND p.user_id = ?
              ORDER BY p.created_at DESC
              LIMIT ?`,
        args: [before, user.id, PAGE_SIZE],
      });
    } else {
      result = await db.execute({
        sql: `SELECT p.id, p.content, p.language, p.prayer_count, p.created_at, p.user_id, u.username
              FROM posts p JOIN users u ON u.id = p.user_id
              WHERE p.created_at < ? AND p.hidden = 0
              ORDER BY p.created_at DESC
              LIMIT ?`,
        args: [before, PAGE_SIZE],
      });
    }
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
    const language: Lang = LANGS.includes(body.language) ? body.language : "en";

    const moderation = moderatePost(content);
    if (!moderation.ok) {
      return NextResponse.json(
        { error: "moderation", reason: moderation.reason },
        { status: 422 }
      );
    }

    const db = await getDb();
    const allowedNow = await checkRateLimit(
      db,
      `post:${user.id}`,
      5,
      60 * 60 * 1000
    );
    const allowedToday = await checkRateLimit(
      db,
      `post-day:${user.id}`,
      20,
      24 * 60 * 60 * 1000
    );
    if (!allowedNow || !allowedToday) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    // Second layer: AI moderation (no-op without ANTHROPIC_API_KEY).
    if (!(await aiModerate(content))) {
      return NextResponse.json(
        { error: "moderation", reason: "blocked" },
        { status: 422 }
      );
    }

    const id = newId();
    const createdAt = Date.now();
    const category = detectCategory(content);
    await db.execute({
      sql: "INSERT INTO posts (id, user_id, content, language, category, prayer_count, hidden, created_at) VALUES (?, ?, ?, ?, ?, 0, 0, ?)",
      args: [id, user.id, content, language, category, createdAt],
    });

    // The prayer bot: right after publishing, read the intention and
    // prepare a fitting prayer in every language, so the first person
    // who taps "Pray" gets it instantly.
    after(async () => {
      for (const lang of LANGS) {
        try {
          const existing = await db.execute({
            sql: "SELECT 1 FROM generated_prayers WHERE post_id = ? AND language = ?",
            args: [id, lang],
          });
          if (existing.rows.length > 0) continue;
          const prayer =
            (await generatePrayerWithAI(content, lang)) ??
            composePrayer(category as Category, lang, id);
          await db.execute({
            sql: "INSERT OR REPLACE INTO generated_prayers (post_id, language, text, created_at) VALUES (?, ?, ?, ?)",
            args: [id, lang, prayer, Date.now()],
          });
        } catch {
          // Cache miss is fine — the pray endpoint regenerates on demand.
        }
      }
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
