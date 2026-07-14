import type { Lang } from "./prayerEngine";

/** Splash-screen phrases, shown under the app name while loading. */
export const SPLASH_PHRASES: Record<Lang, string[]> = {
  en: [
    "Pray for others",
    "United in prayer",
    "Carry one another's burdens",
    "One world, one prayer",
    "Lift someone up today",
    "Where two or three are gathered…",
    "Faith moves mountains",
    "No one prays alone",
    "Your prayer matters",
    "Light a candle with your heart",
  ],
  de: [
    "Bete für andere",
    "Vereint im Gebet",
    "Tragt einer des anderen Last",
    "Eine Welt, ein Gebet",
    "Schenke heute jemandem Hoffnung",
    "Wo zwei oder drei versammelt sind…",
    "Der Glaube versetzt Berge",
    "Niemand betet allein",
    "Dein Gebet zählt",
    "Entzünde eine Kerze mit deinem Herzen",
  ],
  it: [
    "Prega per gli altri",
    "Uniti nella preghiera",
    "Portate i pesi gli uni degli altri",
    "Un mondo, una preghiera",
    "Dona speranza a qualcuno oggi",
    "Dove due o tre sono riuniti…",
    "La fede sposta le montagne",
    "Nessuno prega da solo",
    "La tua preghiera conta",
    "Accendi una candela con il cuore",
  ],
};

/** Picks a random phrase, avoiding the previous one. */
export function pickPhrase(lang: Lang, previous: string | null): string {
  const pool = SPLASH_PHRASES[lang].filter((p) => p !== previous);
  return pool[Math.floor(Math.random() * pool.length)];
}
