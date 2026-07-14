import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { syncOfficialIntentions } from "@/lib/officialIntentions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily Vercel cron: fetch verified world events and post the new ones
 *  as official prayer intentions. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  try {
    const db = await getDb();
    const created = await syncOfficialIntentions(db);
    await db.execute({
      sql: "INSERT OR REPLACE INTO meta (key, value) VALUES ('official_last_sync', ?)",
      args: [String(Date.now())],
    });
    return NextResponse.json({ ok: true, created });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
