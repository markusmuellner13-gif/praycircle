import type { Client } from "@libsql/client";
import { newId } from "./db";
import { composePrayer, generatePrayerWithAI, type Lang } from "./prayerEngine";

/**
 * The official @PrayCircle account.
 *
 * A background job reads real, verified world events from public
 * humanitarian sources and posts them as prayer intentions under the
 * official account (shown with a verified badge in the app):
 *
 *  - USGS (United States Geological Survey): significant earthquakes
 *  - GDACS (Global Disaster Alert and Coordination System, UN/EC):
 *    Orange/Red alerts for cyclones, floods, volcanoes, droughts
 *
 * Events are deduplicated via posts.source_id, stored permanently in the
 * database, and never invented — no real event, no post.
 */

export const OFFICIAL_USERNAME = "PrayCircle";
const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const MAX_NEW_PER_SYNC = 6;
const MAX_EVENT_AGE_MS = 7 * 24 * 60 * 60 * 1000; // last 7 days (earthquakes)
// GDACS keeps ongoing events (cyclones, droughts) in the feed with their
// original alert date, so allow a wider window there.
const MAX_GDACS_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const LANGS: Lang[] = ["en", "de", "it"];

interface OfficialEvent {
  sourceId: string;
  content: string;
  time: number;
}

export async function ensureOfficialUser(db: Client): Promise<string> {
  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE username = ?",
    args: [OFFICIAL_USERNAME],
  });
  if (existing.rows.length > 0) return String(existing.rows[0].id);
  const id = newId();
  await db.execute({
    sql: `INSERT INTO users (id, username, email, password_hash, language, created_at, official, auth_provider)
          VALUES (?, ?, ?, ?, 'en', ?, 1, 'system')`,
    // "!" is not a valid bcrypt hash, so no password can ever match.
    args: [id, OFFICIAL_USERNAME, "official@praycircle.app", "!", Date.now()],
  });
  return id;
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

/** Significant earthquakes (M ≥ 6.0) from the USGS public feed. */
async function fetchUsgsEarthquakes(): Promise<OfficialEvent[]> {
  try {
    const response = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson",
      { signal: AbortSignal.timeout(10000) }
    );
    if (!response.ok) return [];
    const data = await response.json();
    const events: OfficialEvent[] = [];
    for (const feature of data?.features ?? []) {
      const magnitude = Number(feature?.properties?.mag ?? 0);
      const place = String(feature?.properties?.place ?? "").trim();
      const time = Number(feature?.properties?.time ?? 0);
      const id = String(feature?.id ?? "");
      if (magnitude < 6.0 || !place || !id) continue;
      if (Date.now() - time > MAX_EVENT_AGE_MS) continue;
      events.push({
        sourceId: `usgs:${id}`,
        content: truncate(
          `Earthquake (M${magnitude.toFixed(1)}) ${place} — pray for everyone affected, the injured and the rescue teams.`,
          180
        ),
        time,
      });
    }
    return events;
  } catch {
    return [];
  }
}

/** Orange/Red disaster alerts from the GDACS RSS feed (UN/EC system). */
async function fetchGdacsAlerts(): Promise<OfficialEvent[]> {
  try {
    const response = await fetch("https://www.gdacs.org/xml/rss.xml", {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return [];
    const xml = await response.text();
    const events: OfficialEvent[] = [];
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
    for (const item of items) {
      const alertLevel =
        item.match(/<gdacs:alertlevel>\s*(\w+)\s*<\/gdacs:alertlevel>/i)?.[1] ?? "";
      if (!/^(orange|red)$/i.test(alertLevel)) continue;
      const guid = item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1]?.trim() ?? "";
      let title = item.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
      title = title
        .replace(/<!\[CDATA\[|\]\]>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim();
      const time = pubDate ? Date.parse(pubDate) : Date.now();
      if (!guid || !title) continue;
      if (Number.isFinite(time) && Date.now() - time > MAX_GDACS_AGE_MS) continue;
      // Titles look like "Red notification for tropical cyclone X. Population
      // affected by …" — keep only the first sentence.
      const firstSentence = title.split(". ")[0].replace(/\.$/, "");
      const headline = firstSentence.length >= 20 ? firstSentence : title;
      events.push({
        sourceId: `gdacs:${guid}`,
        content: truncate(
          `${headline} — pray for all who are in danger and for the helpers on the ground.`,
          180
        ),
        time: Number.isFinite(time) ? time : Date.now(),
      });
    }
    return events;
  } catch {
    return [];
  }
}

/** Fetches real events and posts the new ones as official intentions.
 *  Returns the number of new posts created. */
export async function syncOfficialIntentions(db: Client): Promise<number> {
  const officialId = await ensureOfficialUser(db);

  const [usgs, gdacs] = await Promise.all([
    fetchUsgsEarthquakes(),
    fetchGdacsAlerts(),
  ]);
  const candidates = [...usgs, ...gdacs].sort((a, b) => b.time - a.time);
  if (candidates.length === 0) return 0;

  const existing = await db.execute({
    sql: "SELECT source_id FROM posts WHERE source_id IS NOT NULL",
    args: [],
  });
  const known = new Set(existing.rows.map((row) => String(row.source_id)));

  let created = 0;
  for (const event of candidates) {
    if (created >= MAX_NEW_PER_SYNC) break;
    if (known.has(event.sourceId)) continue;
    const postId = newId();
    await db.execute({
      sql: `INSERT INTO posts (id, user_id, content, language, category, prayer_count, hidden, created_at, source_id)
            VALUES (?, ?, ?, 'en', 'disaster', 0, 0, ?, ?)`,
      args: [postId, officialId, event.content, Date.now(), event.sourceId],
    });
    known.add(event.sourceId);
    created++;
    // Pre-generate the fitting prayer in every language.
    for (const lang of LANGS) {
      try {
        const prayer =
          (await generatePrayerWithAI(event.content, lang)) ??
          composePrayer("disaster", lang, postId);
        await db.execute({
          sql: "INSERT OR REPLACE INTO generated_prayers (post_id, language, text, created_at) VALUES (?, ?, ?, ?)",
          args: [postId, lang, prayer, Date.now()],
        });
      } catch {
        // The pray endpoint regenerates on demand.
      }
    }
  }
  return created;
}

/** Runs a sync if the last one is older than SYNC_INTERVAL_MS.
 *  Safe to call on every feed request (guarded + fire-and-forget). */
export async function syncOfficialIfStale(db: Client): Promise<void> {
  const result = await db.execute({
    sql: "SELECT value FROM meta WHERE key = 'official_last_sync'",
    args: [],
  });
  const last = result.rows.length > 0 ? Number(result.rows[0].value) : 0;
  if (Date.now() - last < SYNC_INTERVAL_MS) return;
  // Claim the slot first so concurrent requests don't double-sync.
  await db.execute({
    sql: "INSERT OR REPLACE INTO meta (key, value) VALUES ('official_last_sync', ?)",
    args: [String(Date.now())],
  });
  await syncOfficialIntentions(db);
}
