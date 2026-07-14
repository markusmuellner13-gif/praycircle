import type { Lang } from "./prayerEngine";

const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  de: "German",
  it: "Italian",
};

async function translateWithAI(
  text: string,
  from: string,
  to: Lang
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
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
        max_tokens: 300,
        system:
          "Translate the user's text faithfully. Output only the translation, nothing else.",
        messages: [
          {
            role: "user",
            content: `Translate into ${LANG_NAMES[to]}:\n\n${text}`,
          },
        ],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const result = data?.content?.[0]?.text;
    return typeof result === "string" && result.trim() ? result.trim() : null;
  } catch {
    return null;
  }
}

/** Free fallback translation via the MyMemory public API. */
async function translateWithMyMemory(
  text: string,
  from: string,
  to: Lang
): Promise<string | null> {
  try {
    const source = ["en", "de", "it"].includes(from) ? from : "en";
    if (source === to) return text;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=${source}|${to}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;
    const data = await response.json();
    const result = data?.responseData?.translatedText;
    return typeof result === "string" && result.trim() ? result.trim() : null;
  } catch {
    return null;
  }
}

export async function translateText(
  text: string,
  from: string,
  to: Lang
): Promise<string | null> {
  return (
    (await translateWithAI(text, from, to)) ??
    (await translateWithMyMemory(text, from, to))
  );
}
