import type { Client } from "@libsql/client";

/**
 * Sliding-window rate limiter backed by the database (works across
 * serverless instances). Returns true when the action is allowed.
 */
export async function checkRateLimit(
  db: Client,
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - windowMs;

  const result = await db.execute({
    sql: "SELECT COUNT(*) AS n FROM rate_limits WHERE key = ? AND ts > ?",
    args: [key, windowStart],
  });
  if (Number(result.rows[0].n) >= limit) return false;

  await db.execute({
    sql: "INSERT INTO rate_limits (key, ts) VALUES (?, ?)",
    args: [key, now],
  });
  // Opportunistic cleanup of expired entries for this key.
  await db.execute({
    sql: "DELETE FROM rate_limits WHERE key = ? AND ts <= ?",
    args: [key, windowStart],
  });
  return true;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}
