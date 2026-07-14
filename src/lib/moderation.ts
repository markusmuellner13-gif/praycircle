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

export function validateUsername(raw: string): string | null {
  const username = raw.trim();
  if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) return null;
  const normalized = ` ${normalize(username.replace(/[_.]/g, " "))} `;
  for (const term of BLOCKLIST) {
    if (normalized.includes(` ${term} `)) return null;
  }
  return username;
}
