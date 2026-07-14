"use client";

import LegalPage, { type LegalDoc } from "@/components/LegalPage";
import type { Lang } from "@/lib/i18n";

const content: Record<Lang, LegalDoc> = {
  en: {
    title: "Cookie Policy",
    updated: "Last updated: 14 July 2026",
    sections: [
      {
        heading: "1. What We Use",
        paragraphs: [
          "In line with the Guidelines on cookies of the Italian Data Protection Authority (Garante, 10 June 2021) and Art. 122 of the Italian Codice Privacy, PrayCircle uses only technical cookies and local storage that are strictly necessary for the service. No consent is required for these, but we inform you transparently:",
        ],
        bullets: [
          "praycircle_session (cookie): keeps you signed in. Duration: 30 days. Strictly necessary.",
          "praycircle_lang (local storage): remembers your chosen language.",
          "praycircle_last_phrase (local storage): remembers the last welcome phrase so you don't see the same one twice in a row.",
          "praycircle_cookie_notice (local storage): remembers that you dismissed the cookie notice.",
        ],
      },
      {
        heading: "2. What We Don't Use",
        paragraphs: [
          "PrayCircle uses no profiling cookies, no advertising cookies, no analytics trackers and no third-party cookies. That's why we don't need a consent banner — just this notice.",
        ],
      },
      {
        heading: "3. Managing Cookies",
        paragraphs: [
          "You can delete cookies and local storage at any time through your browser settings. Note that deleting the session cookie signs you out.",
        ],
      },
    ],
  },
  de: {
    title: "Cookie-Richtlinie",
    updated: "Zuletzt aktualisiert: 14. Juli 2026",
    sections: [
      {
        heading: "1. Was wir verwenden",
        paragraphs: [
          "Im Einklang mit den Cookie-Leitlinien der italienischen Datenschutzbehörde (Garante, 10. Juni 2021) und Art. 122 des italienischen Codice Privacy verwendet PrayCircle ausschließlich technische Cookies und lokalen Speicher, die für den Dienst unbedingt erforderlich sind. Dafür ist keine Einwilligung nötig, wir informieren aber transparent:",
        ],
        bullets: [
          "praycircle_session (Cookie): hält dich angemeldet. Dauer: 30 Tage. Unbedingt erforderlich.",
          "praycircle_lang (lokaler Speicher): merkt sich deine gewählte Sprache.",
          "praycircle_last_phrase (lokaler Speicher): merkt sich den letzten Begrüßungsspruch, damit du nicht zweimal hintereinander denselben siehst.",
          "praycircle_cookie_notice (lokaler Speicher): merkt sich, dass du den Cookie-Hinweis geschlossen hast.",
        ],
      },
      {
        heading: "2. Was wir nicht verwenden",
        paragraphs: [
          "PrayCircle verwendet keine Profiling-Cookies, keine Werbe-Cookies, keine Analyse-Tracker und keine Drittanbieter-Cookies. Deshalb brauchen wir kein Einwilligungsbanner — nur diesen Hinweis.",
        ],
      },
      {
        heading: "3. Cookies verwalten",
        paragraphs: [
          "Du kannst Cookies und lokalen Speicher jederzeit über deine Browsereinstellungen löschen. Beachte: Das Löschen des Sitzungs-Cookies meldet dich ab.",
        ],
      },
    ],
  },
  it: {
    title: "Cookie Policy",
    updated: "Ultimo aggiornamento: 14 luglio 2026",
    sections: [
      {
        heading: "1. Cosa utilizziamo",
        paragraphs: [
          "In conformità alle Linee guida sui cookie del Garante per la Protezione dei Dati Personali (10 giugno 2021) e all'art. 122 del Codice Privacy, PrayCircle utilizza esclusivamente cookie tecnici e archiviazione locale strettamente necessari al servizio. Per questi non è richiesto il consenso, ma ti informiamo con trasparenza:",
        ],
        bullets: [
          "praycircle_session (cookie): ti mantiene connesso. Durata: 30 giorni. Strettamente necessario.",
          "praycircle_lang (archiviazione locale): ricorda la lingua scelta.",
          "praycircle_last_phrase (archiviazione locale): ricorda l'ultima frase di benvenuto per non mostrartela due volte di seguito.",
          "praycircle_cookie_notice (archiviazione locale): ricorda che hai chiuso l'avviso sui cookie.",
        ],
      },
      {
        heading: "2. Cosa non utilizziamo",
        paragraphs: [
          "PrayCircle non utilizza cookie di profilazione, cookie pubblicitari, tracker di analisi né cookie di terze parti. Per questo non è necessario un banner di consenso — solo questa informativa.",
        ],
      },
      {
        heading: "3. Gestione dei cookie",
        paragraphs: [
          "Puoi eliminare i cookie e l'archiviazione locale in qualsiasi momento dalle impostazioni del tuo browser. Nota: eliminando il cookie di sessione verrai disconnesso.",
        ],
      },
    ],
  },
};

export default function CookiesPage() {
  return <LegalPage content={content} />;
}
