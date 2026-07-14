import webpush from "web-push";
import type { Client } from "@libsql/client";

let configured = false;

function ensureConfigured(): boolean {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  if (!configured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:markusmuellner13@gmail.com",
      publicKey,
      privateKey
    );
    configured = true;
  }
  return true;
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY || null;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
}

/** Sends a push notification to every subscription of a user.
 *  Dead subscriptions (unsubscribed browsers) are pruned. */
export async function sendPushToUser(
  db: Client,
  userId: string,
  payload: PushPayload
): Promise<void> {
  if (!ensureConfigured()) return;
  const result = await db.execute({
    sql: "SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?",
    args: [userId],
  });
  const body = JSON.stringify(payload);
  await Promise.all(
    result.rows.map(async (row) => {
      const endpoint = String(row.endpoint);
      try {
        await webpush.sendNotification(
          {
            endpoint,
            keys: { p256dh: String(row.p256dh), auth: String(row.auth) },
          },
          body
        );
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await db
            .execute({
              sql: "DELETE FROM push_subscriptions WHERE endpoint = ?",
              args: [endpoint],
            })
            .catch(() => {});
        }
      }
    })
  );
}
