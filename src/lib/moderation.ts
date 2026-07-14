/**
 * Content moderation for prayer intentions.
 * Blocks hateful, racist, violent and profane content so that only
 * genuine, prayable intentions can be posted.
 */

export const MAX_POST_LENGTH = 180;
export const MIN_POST_LENGTH = 4;

// Normalized (lowercase) blocklist. Matched on word boundaries after
// light normalization (leetspeak, repeated letters, accents).
const BLOCKLIST: string[] = [
  // English profanity / hate
  "fuck", "fucking", "shit", "bitch", "asshole", "bastard", "cunt", "dick",
  "whore", "slut", "faggot", "fag", "nigger", "nigga", "retard", "retarded",
  "kike", "spic", "chink", "wetback", "raghead", "tranny", "coon",
  "kill yourself", "kys", "die in", "i hate", "hate all", "death to",
  "gas the", "hang the", "lynch", "heil hitler", "sieg heil", "white power",
  "kkk", "nazi scum", "terrorist attack",
  // German
  "scheisse", "scheiße", "arschloch", "fotze", "hurensohn", "wichser",
  "schlampe", "missgeburt", "untermensch", "judensau", "kanake", "neger",
  "schwuchtel", "ich hasse", "tod allen", "vergast",
  // Italian
  "vaffanculo", "stronzo", "puttana", "troia", "merda", "cazzo", "frocio",
  "negro di merda", "sporco ebreo", "sporco negro", "terrone di merda",
  "ammazzati", "ucciditi", "odio tutti", "morte a",
];

// Things that are clearly not prayer intentions.
const SPAM_PATTERNS: RegExp[] = [
  /https?:\/\//i,
  /www\./i,
  /\b(buy|sale|discount|promo code|casino|crypto|bitcoin|forex|onlyfans)\b/i,
  /\b(follow me|subscribe|check out my)\b/i,
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/\$/g, "s")
    .replace(/@/g, "a")
    .replace(/(.)\1{2,}/g, "$1$1")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: "too_short" | "too_long" | "blocked" | "spam" };

export function moderatePost(raw: string): ModerationResult {
  const text = raw.trim();
  if (text.length < MIN_POST_LENGTH) return { ok: false, reason: "too_short" };
  if (text.length > MAX_POST_LENGTH) return { ok: false, reason: "too_long" };

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) return { ok: false, reason: "spam" };
  }

  const normalized = ` ${normalize(text)} `;
  for (const term of BLOCKLIST) {
    if (normalized.includes(` ${term} `) || normalized.includes(` ${term}s `)) {
      return { ok: false, reason: "blocked" };
    }
  }
  return { ok: true };
}

/**
 * Second moderation layer: when ANTHROPIC_API_KEY is configured, an LLM
 * verifies the text is a genuine, non-hateful prayer intention before it
 * is published. Fails open (allows) on API errors so posting never breaks.
 */
export async function aiModerate(content: string): Promise<boolean> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return true;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 5,
        system:
          "You moderate a Catholic prayer-intention app. The user submits a short text. Answer with exactly one word: ALLOW if it is a genuine prayer intention or request for prayer (any language, any topic of genuine need or thanksgiving), or BLOCK if it contains hate, racism, harassment, threats, obscenity, mockery of faith, spam/advertising, or is clearly not a prayer intention.",
        messages: [{ role: "user", content }],
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return true;
    const data = await response.json();
    const verdict = String(data?.content?.[0]?.text ?? "ALLOW").toUpperCase();
    return !verdict.includes("BLOCK");
  } catch {
    return true;
  }
}

const RESERVED_USERNAMES = [
  "praycircle", "official", "admin", "administrator", "moderator", "support", "system",
];

export function validateUsername(raw: string): string | null {
  const username = raw.trim();
  if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) return null;
  const flat = username.toLowerCase().replace(/[_.]/g, "");
  if (RESERVED_USERNAMES.some((r) => flat === r || flat.includes("praycircle"))) {
    return null;
  }
  const normalized = ` ${normalize(username.replace(/[_.]/g, " "))} `;
  for (const term of BLOCKLIST) {
    if (normalized.includes(` ${term} `)) return null;
  }
  return username;
}
