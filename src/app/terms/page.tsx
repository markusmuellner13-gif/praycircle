"use client";

import LegalPage, { type LegalDoc } from "@/components/LegalPage";
import type { Lang } from "@/lib/i18n";

const CONTACT = "markusmuellner13@gmail.com";

const content: Record<Lang, LegalDoc> = {
  en: {
    title: "Terms of Service",
    updated: "Last updated: 14 July 2026",
    sections: [
      {
        heading: "1. The Service",
        paragraphs: [
          `PrayCircle is a free community service, operated from Italy (contact: ${CONTACT}), that lets users share short prayer intentions and pray for the intentions of others. By creating an account you accept these Terms, which are governed by Italian law.`,
        ],
      },
      {
        heading: "2. Eligibility and Accounts",
        paragraphs: [
          "You must be at least 14 years old to use PrayCircle autonomously (Art. 2-quinquies, Italian Legislative Decree 196/2003); younger users need the consent of a parent or guardian. You are responsible for keeping your credentials confidential. Each username is unique and may not impersonate other people or organizations.",
        ],
      },
      {
        heading: "3. Community Rules",
        paragraphs: ["PrayCircle exists only for genuine prayer intentions. It is forbidden to post:"],
        bullets: [
          "hateful, racist, discriminatory, violent, threatening or harassing content;",
          "obscene or blasphemous content, spam, advertising or links;",
          "personal data of third parties (full names, addresses, health details of identifiable people) without their consent;",
          "any content that violates Italian law or the rights of others.",
        ],
      },
      {
        heading: "4. Moderation",
        paragraphs: [
          "Posts are checked automatically before publication, and we may remove content or suspend accounts that violate these Terms, in line with our duties under the EU Digital Services Act (Regulation (EU) 2022/2065). You may report content or appeal a moderation decision by writing to the contact address above.",
        ],
      },
      {
        heading: "5. Your Content",
        paragraphs: [
          "You keep all rights to the intentions you post. You grant PrayCircle a non-exclusive, free license to store, display and translate them for the sole purpose of operating the service. You can delete your posts or your entire account at any time.",
        ],
      },
      {
        heading: "6. Prayers and Spiritual Content",
        paragraphs: [
          "Prayers shown by the app are generated texts inspired by Catholic tradition. They are offered as a devotional aid, are not official liturgical texts and do not replace the sacraments, spiritual direction, or professional medical, psychological, legal or financial advice.",
        ],
      },
      {
        heading: "7. Liability",
        paragraphs: [
          "The service is provided free of charge and 'as is'. To the extent permitted by Italian law, we are liable only for willful misconduct (dolo) and gross negligence (colpa grave); mandatory consumer rights under the Italian Consumer Code (Legislative Decree 206/2005) remain unaffected.",
        ],
      },
      {
        heading: "8. Termination",
        paragraphs: [
          "You may delete your account at any time from the Account page. We may terminate or suspend accounts that violate these Terms. Upon deletion, your data is removed as described in the Privacy Policy.",
        ],
      },
      {
        heading: "9. Governing Law and Disputes",
        paragraphs: [
          "These Terms are governed by Italian law. For consumers residing in Italy, the competent court is the court of your place of residence or domicile (Art. 66-bis, Consumer Code). The European Commission provides an online dispute resolution platform at https://ec.europa.eu/consumers/odr.",
        ],
      },
    ],
  },
  de: {
    title: "Nutzungsbedingungen",
    updated: "Zuletzt aktualisiert: 14. Juli 2026",
    sections: [
      {
        heading: "1. Der Dienst",
        paragraphs: [
          `PrayCircle ist ein kostenloser Gemeinschaftsdienst, betrieben von Italien aus (Kontakt: ${CONTACT}), mit dem Nutzer kurze Gebetsanliegen teilen und für die Anliegen anderer beten können. Mit der Erstellung eines Kontos akzeptierst du diese Bedingungen, die italienischem Recht unterliegen.`,
        ],
      },
      {
        heading: "2. Teilnahme und Konten",
        paragraphs: [
          "Du musst mindestens 14 Jahre alt sein, um PrayCircle eigenständig zu nutzen (Art. 2-quinquies, ital. Gesetzesdekret 196/2003); jüngere Nutzer benötigen die Zustimmung eines Erziehungsberechtigten. Du bist für die Vertraulichkeit deiner Zugangsdaten verantwortlich. Jeder Benutzername ist einzigartig und darf keine anderen Personen oder Organisationen nachahmen.",
        ],
      },
      {
        heading: "3. Gemeinschaftsregeln",
        paragraphs: ["PrayCircle dient ausschließlich echten Gebetsanliegen. Verboten ist das Veröffentlichen von:"],
        bullets: [
          "hasserfüllten, rassistischen, diskriminierenden, gewalttätigen, drohenden oder belästigenden Inhalten;",
          "obszönen oder blasphemischen Inhalten, Spam, Werbung oder Links;",
          "personenbezogenen Daten Dritter (vollständige Namen, Adressen, Gesundheitsdaten identifizierbarer Personen) ohne deren Zustimmung;",
          "Inhalten, die gegen italienisches Recht oder die Rechte anderer verstoßen.",
        ],
      },
      {
        heading: "4. Moderation",
        paragraphs: [
          "Beiträge werden vor der Veröffentlichung automatisch geprüft; wir können Inhalte entfernen oder Konten sperren, die gegen diese Bedingungen verstoßen, im Einklang mit unseren Pflichten aus dem Digital Services Act der EU (Verordnung (EU) 2022/2065). Inhalte melden oder Moderationsentscheidungen anfechten kannst du über die oben genannte Kontaktadresse.",
        ],
      },
      {
        heading: "5. Deine Inhalte",
        paragraphs: [
          "Du behältst alle Rechte an deinen Anliegen. Du räumst PrayCircle eine nicht-exklusive, unentgeltliche Lizenz ein, sie ausschließlich zum Betrieb des Dienstes zu speichern, anzuzeigen und zu übersetzen. Du kannst deine Beiträge oder dein gesamtes Konto jederzeit löschen.",
        ],
      },
      {
        heading: "6. Gebete und spirituelle Inhalte",
        paragraphs: [
          "Die von der App angezeigten Gebete sind generierte Texte, inspiriert von der katholischen Tradition. Sie sind eine Gebetshilfe, keine offiziellen liturgischen Texte und ersetzen weder die Sakramente noch geistliche Begleitung oder professionelle medizinische, psychologische, rechtliche oder finanzielle Beratung.",
        ],
      },
      {
        heading: "7. Haftung",
        paragraphs: [
          "Der Dienst wird kostenlos und „wie besehen“ bereitgestellt. Soweit nach italienischem Recht zulässig, haften wir nur für Vorsatz (dolo) und grobe Fahrlässigkeit (colpa grave); zwingende Verbraucherrechte nach dem italienischen Verbrauchergesetzbuch (Gesetzesdekret 206/2005) bleiben unberührt.",
        ],
      },
      {
        heading: "8. Beendigung",
        paragraphs: [
          "Du kannst dein Konto jederzeit auf der Kontoseite löschen. Wir können Konten beenden oder sperren, die gegen diese Bedingungen verstoßen. Bei der Löschung werden deine Daten wie in der Datenschutzerklärung beschrieben entfernt.",
        ],
      },
      {
        heading: "9. Anwendbares Recht und Streitigkeiten",
        paragraphs: [
          "Diese Bedingungen unterliegen italienischem Recht. Für Verbraucher mit Wohnsitz in Italien ist das Gericht des Wohnsitzes oder Aufenthaltsorts zuständig (Art. 66-bis Verbrauchergesetzbuch). Die Europäische Kommission stellt unter https://ec.europa.eu/consumers/odr eine Plattform zur Online-Streitbeilegung bereit.",
        ],
      },
    ],
  },
  it: {
    title: "Termini di Servizio",
    updated: "Ultimo aggiornamento: 14 luglio 2026",
    sections: [
      {
        heading: "1. Il Servizio",
        paragraphs: [
          `PrayCircle è un servizio comunitario gratuito, gestito dall'Italia (contatto: ${CONTACT}), che consente agli utenti di condividere brevi intenzioni di preghiera e di pregare per le intenzioni degli altri. Creando un account accetti i presenti Termini, regolati dalla legge italiana.`,
        ],
      },
      {
        heading: "2. Requisiti e account",
        paragraphs: [
          "Devi avere almeno 14 anni per utilizzare PrayCircle autonomamente (art. 2-quinquies, D.lgs. 196/2003); gli utenti più giovani necessitano del consenso di un genitore o tutore. Sei responsabile della riservatezza delle tue credenziali. Ogni nome utente è unico e non può impersonare altre persone o organizzazioni.",
        ],
      },
      {
        heading: "3. Regole della community",
        paragraphs: ["PrayCircle esiste solo per intenzioni di preghiera autentiche. È vietato pubblicare:"],
        bullets: [
          "contenuti di odio, razzisti, discriminatori, violenti, minacciosi o molesti;",
          "contenuti osceni o blasfemi, spam, pubblicità o link;",
          "dati personali di terzi (nomi completi, indirizzi, dettagli sanitari di persone identificabili) senza il loro consenso;",
          "qualsiasi contenuto che violi la legge italiana o i diritti altrui.",
        ],
      },
      {
        heading: "4. Moderazione",
        paragraphs: [
          "I contenuti vengono verificati automaticamente prima della pubblicazione; possiamo rimuovere contenuti o sospendere account che violano i presenti Termini, in linea con i nostri obblighi ai sensi del Digital Services Act dell'UE (Regolamento (UE) 2022/2065). Puoi segnalare contenuti o contestare una decisione di moderazione scrivendo all'indirizzo di contatto sopra indicato.",
        ],
      },
      {
        heading: "5. I tuoi contenuti",
        paragraphs: [
          "Mantieni tutti i diritti sulle intenzioni che pubblichi. Concedi a PrayCircle una licenza non esclusiva e gratuita per conservarle, mostrarle e tradurle al solo scopo di far funzionare il servizio. Puoi eliminare i tuoi contenuti o l'intero account in qualsiasi momento.",
        ],
      },
      {
        heading: "6. Preghiere e contenuti spirituali",
        paragraphs: [
          "Le preghiere mostrate dall'app sono testi generati, ispirati alla tradizione cattolica. Sono offerte come aiuto devozionale, non sono testi liturgici ufficiali e non sostituiscono i sacramenti, la direzione spirituale né la consulenza medica, psicologica, legale o finanziaria professionale.",
        ],
      },
      {
        heading: "7. Responsabilità",
        paragraphs: [
          "Il servizio è fornito gratuitamente e «così com'è». Nei limiti consentiti dalla legge italiana, rispondiamo solo per dolo e colpa grave; restano ferme le tutele inderogabili previste dal Codice del Consumo (D.lgs. 206/2005).",
        ],
      },
      {
        heading: "8. Cessazione",
        paragraphs: [
          "Puoi eliminare il tuo account in qualsiasi momento dalla pagina Account. Possiamo chiudere o sospendere gli account che violano i presenti Termini. Alla cancellazione, i tuoi dati vengono rimossi come descritto nell'Informativa sulla Privacy.",
        ],
      },
      {
        heading: "9. Legge applicabile e controversie",
        paragraphs: [
          "I presenti Termini sono regolati dalla legge italiana. Per i consumatori residenti in Italia è competente il foro del luogo di residenza o domicilio (art. 66-bis Codice del Consumo). La Commissione Europea mette a disposizione una piattaforma per la risoluzione online delle controversie: https://ec.europa.eu/consumers/odr.",
        ],
      },
    ],
  },
};

export default function TermsPage() {
  return <LegalPage content={content} />;
}
