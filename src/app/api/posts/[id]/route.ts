import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT user_id FROM posts WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (String(result.rows[0].user_id) !== session.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await db.execute({ sql: "DELETE FROM generated_prayers WHERE post_id = ?", args: [id] });
  await db.execute({ sql: "DELETE FROM translations WHERE post_id = ?", args: [id] });
  await db.execute({ sql: "DELETE FROM notifications WHERE post_id = ?", args: [id] });
  await db.execute({ sql: "DELETE FROM posts WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
