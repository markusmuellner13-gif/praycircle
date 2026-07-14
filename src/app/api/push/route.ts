import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getVapidPublicKey } from "@/lib/push";

export const dynamic = "force-dynamic";

/** Public VAPID key for the client's pushManager.subscribe(). */
export async function GET() {
  const key = getVapidPublicKey();
  if (!key) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  return NextResponse.json({ key });
}

/** Save a push subscription for the signed-in user. */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const endpoint = String(body?.endpoint || "");
    const p256dh = String(body?.keys?.p256dh || "");
    const auth = String(body?.keys?.auth || "");
    if (!endpoint.startsWith("https://") || !p256dh || !auth) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    const db = await getDb();
    await db.execute({
      sql: "INSERT OR REPLACE INTO push_subscriptions (endpoint, user_id, p256dh, auth, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [endpoint, session.id, p256dh, auth, Date.now()],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

/** Remove a push subscription. */
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const endpoint = String(body?.endpoint || "");
    if (!endpoint) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    const db = await getDb();
    await db.execute({
      sql: "DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?",
      args: [endpoint, session.id],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
