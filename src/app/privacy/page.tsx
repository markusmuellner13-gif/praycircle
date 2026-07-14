"use client";

import LegalPage, { type LegalDoc } from "@/components/LegalPage";
import type { Lang } from "@/lib/i18n";

const CONTACT = "markusmuellner13@gmail.com";

const content: Record<Lang, LegalDoc> = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated: 14 July 2026",
    sections: [
      {
        heading: "1. Data Controller",
        paragraphs: [
          `This privacy policy is provided pursuant to Regulation (EU) 2016/679 (“GDPR”) and Italian Legislative Decree No. 196/2003 (“Codice Privacy”), as amended by Legislative Decree No. 101/2018. The data controller of PrayCircle is the operator of this service, reachable at ${CONTACT}. PrayCircle is operated from Italy and is subject to the supervision of the Italian Data Protection Authority (Garante per la Protezione dei Dati Personali).`,
        ],
      },
      {
        heading: "2. Data We Process",
        paragraphs: ["We process only the data strictly necessary to run the service:"],
        bullets: [
          "Account data: email address, username, password (stored only as a cryptographic hash), preferred language, account creation date.",
          "Content data: the prayer intentions you choose to post and the prayer interactions (\"Amen\") connected to them.",
          "Technical data: session cookies strictly necessary for authentication. We do not use profiling, advertising or analytics trackers.",
        ],
      },
      {
        heading: "3. Special Categories of Data",
        paragraphs: [
          "Prayer intentions may reveal religious beliefs or health information, which are special categories of personal data under Art. 9 GDPR. We process such data only because you deliberately make it public on the platform (Art. 9(2)(e) GDPR) for the purpose of receiving prayers from other users. Please share only what you are comfortable making public and avoid full names or details that identify other people.",
        ],
      },
      {
        heading: "4. Purposes and Legal Bases",
        paragraphs: [""],
        bullets: [
          "Providing the service (account, posting, notifications): performance of a contract, Art. 6(1)(b) GDPR.",
          "Content moderation and abuse prevention: legitimate interest, Art. 6(1)(f) GDPR.",
          "Compliance with legal obligations: Art. 6(1)(c) GDPR.",
        ],
      },
      {
        heading: "5. Data Retention",
        paragraphs: [
          "Your data is retained for as long as your account exists. If you delete your account, your account data, your intentions and your notifications are permanently and immediately deleted. Backup copies are overwritten within the normal backup rotation of our infrastructure providers.",
        ],
      },
      {
        heading: "6. Data Processors and Transfers",
        paragraphs: [
          "We use Vercel Inc. (hosting) and Turso/Iku (database hosting) as processors. Data may be processed in data centers inside and outside the European Economic Area; where transfers outside the EEA occur, they are protected by the European Commission's Standard Contractual Clauses pursuant to Art. 46 GDPR. If AI-assisted prayer generation or translation is enabled, the text of an intention (never your account data) may be processed by Anthropic to generate a prayer or translation.",
          "If you choose 'Sign in with Google' or 'Sign in with Apple', the respective provider confirms your identity to us and shares your email address; we never receive your provider password. Sign-up may be protected by Cloudflare Turnstile, which processes technical connection data to distinguish humans from bots (legitimate interest, Art. 6(1)(f) GDPR). If you enable push notifications, an anonymous delivery address issued by your browser vendor is stored and used solely to deliver your notifications. Official intentions posted by the @PrayCircle account are based on public data from USGS and GDACS and contain no personal data.",
        ],
      },
      {
        heading: "7. Your Rights",
        paragraphs: [
          `Under Articles 15–22 GDPR you have the right to access, rectify, erase, restrict or object to the processing of your data, and the right to data portability. You can exercise these rights by writing to ${CONTACT}, or delete your account and all associated data yourself at any time from the Account page. You also have the right to lodge a complaint with the Garante per la Protezione dei Dati Personali (www.garanteprivacy.it) or the supervisory authority of your country of residence.`,
        ],
      },
      {
        heading: "8. Minors",
        paragraphs: [
          "In accordance with Art. 8 GDPR and Art. 2-quinquies of the Codice Privacy, the service may be used autonomously only by persons aged 14 or older. Younger children may use it only with the consent of a parent or guardian.",
        ],
      },
      {
        heading: "9. Changes",
        paragraphs: [
          "We may update this policy; material changes will be announced in the app. The current version is always available on this page.",
        ],
      },
    ],
  },
  de: {
    title: "Datenschutzerklärung",
    updated: "Zuletzt aktualisiert: 14. Juli 2026",
    sections: [
      {
        heading: "1. Verantwortlicher",
        paragraphs: [
          `Diese Datenschutzerklärung erfolgt gemäß Verordnung (EU) 2016/679 („DSGVO“) und dem italienischen Gesetzesdekret Nr. 196/2003 („Codice Privacy“) in der durch das Gesetzesdekret Nr. 101/2018 geänderten Fassung. Verantwortlicher für PrayCircle ist der Betreiber dieses Dienstes, erreichbar unter ${CONTACT}. PrayCircle wird von Italien aus betrieben und unterliegt der Aufsicht der italienischen Datenschutzbehörde (Garante per la Protezione dei Dati Personali).`,
        ],
      },
      {
        heading: "2. Verarbeitete Daten",
        paragraphs: ["Wir verarbeiten nur die Daten, die für den Betrieb des Dienstes unbedingt erforderlich sind:"],
        bullets: [
          "Kontodaten: E-Mail-Adresse, Benutzername, Passwort (nur als kryptografischer Hash gespeichert), bevorzugte Sprache, Erstellungsdatum des Kontos.",
          "Inhaltsdaten: die Gebetsanliegen, die du veröffentlichst, und die damit verbundenen Gebetsinteraktionen („Amen“).",
          "Technische Daten: Sitzungs-Cookies, die für die Anmeldung unbedingt erforderlich sind. Wir verwenden kein Profiling, keine Werbung und keine Analyse-Tracker.",
        ],
      },
      {
        heading: "3. Besondere Datenkategorien",
        paragraphs: [
          "Gebetsanliegen können religiöse Überzeugungen oder Gesundheitsdaten offenbaren — besondere Kategorien personenbezogener Daten nach Art. 9 DSGVO. Wir verarbeiten solche Daten nur, weil du sie bewusst auf der Plattform öffentlich machst (Art. 9 Abs. 2 lit. e DSGVO), um Gebete anderer Nutzer zu erhalten. Teile bitte nur, was du öffentlich machen möchtest, und vermeide vollständige Namen oder Angaben, die andere Personen identifizieren.",
        ],
      },
      {
        heading: "4. Zwecke und Rechtsgrundlagen",
        paragraphs: [""],
        bullets: [
          "Bereitstellung des Dienstes (Konto, Beiträge, Mitteilungen): Vertragserfüllung, Art. 6 Abs. 1 lit. b DSGVO.",
          "Inhaltsmoderation und Missbrauchsprävention: berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO.",
          "Erfüllung rechtlicher Pflichten: Art. 6 Abs. 1 lit. c DSGVO.",
        ],
      },
      {
        heading: "5. Speicherdauer",
        paragraphs: [
          "Deine Daten werden gespeichert, solange dein Konto besteht. Wenn du dein Konto löschst, werden deine Kontodaten, Anliegen und Mitteilungen sofort und dauerhaft gelöscht. Sicherungskopien werden im Rahmen der üblichen Backup-Rotation unserer Infrastrukturanbieter überschrieben.",
        ],
      },
      {
        heading: "6. Auftragsverarbeiter und Übermittlungen",
        paragraphs: [
          "Wir nutzen Vercel Inc. (Hosting) und Turso/Iku (Datenbank-Hosting) als Auftragsverarbeiter. Daten können in Rechenzentren innerhalb und außerhalb des Europäischen Wirtschaftsraums verarbeitet werden; Übermittlungen außerhalb des EWR sind durch die Standardvertragsklauseln der Europäischen Kommission gemäß Art. 46 DSGVO geschützt. Ist die KI-gestützte Gebetserzeugung oder Übersetzung aktiviert, kann der Text eines Anliegens (niemals deine Kontodaten) durch Anthropic verarbeitet werden.",
          "Wenn du „Mit Google anmelden“ oder „Mit Apple anmelden“ wählst, bestätigt uns der jeweilige Anbieter deine Identität und übermittelt deine E-Mail-Adresse; dein Anbieter-Passwort erhalten wir nie. Die Registrierung kann durch Cloudflare Turnstile geschützt sein, das technische Verbindungsdaten verarbeitet, um Menschen von Bots zu unterscheiden (berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO). Aktivierst du Push-Mitteilungen, wird eine anonyme Zustelladresse deines Browser-Anbieters gespeichert und ausschließlich für die Zustellung deiner Mitteilungen verwendet. Offizielle Anliegen des Kontos @PrayCircle beruhen auf öffentlichen Daten von USGS und GDACS und enthalten keine personenbezogenen Daten.",
        ],
      },
      {
        heading: "7. Deine Rechte",
        paragraphs: [
          `Nach Art. 15–22 DSGVO hast du das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch und Datenübertragbarkeit. Du kannst diese Rechte per E-Mail an ${CONTACT} ausüben oder dein Konto samt aller Daten jederzeit selbst auf der Kontoseite löschen. Außerdem hast du das Recht, Beschwerde bei der Garante per la Protezione dei Dati Personali (www.garanteprivacy.it) oder der Aufsichtsbehörde deines Wohnsitzlandes einzulegen.`,
        ],
      },
      {
        heading: "8. Minderjährige",
        paragraphs: [
          "Gemäß Art. 8 DSGVO und Art. 2-quinquies des Codice Privacy darf der Dienst eigenständig nur von Personen ab 14 Jahren genutzt werden. Jüngere Kinder dürfen ihn nur mit Zustimmung eines Elternteils oder Erziehungsberechtigten nutzen.",
        ],
      },
      {
        heading: "9. Änderungen",
        paragraphs: [
          "Wir können diese Erklärung aktualisieren; wesentliche Änderungen werden in der App angekündigt. Die aktuelle Fassung ist stets auf dieser Seite verfügbar.",
        ],
      },
    ],
  },
  it: {
    title: "Informativa sulla Privacy",
    updated: "Ultimo aggiornamento: 14 luglio 2026",
    sections: [
      {
        heading: "1. Titolare del trattamento",
        paragraphs: [
          `La presente informativa è resa ai sensi del Regolamento (UE) 2016/679 (“GDPR”) e del D.lgs. 30 giugno 2003, n. 196 (“Codice Privacy”), come modificato dal D.lgs. 101/2018. Il titolare del trattamento di PrayCircle è il gestore di questo servizio, contattabile all'indirizzo ${CONTACT}. PrayCircle è gestito dall'Italia ed è soggetto alla vigilanza del Garante per la Protezione dei Dati Personali.`,
        ],
      },
      {
        heading: "2. Dati trattati",
        paragraphs: ["Trattiamo solo i dati strettamente necessari al funzionamento del servizio:"],
        bullets: [
          "Dati dell'account: indirizzo email, nome utente, password (conservata solo come hash crittografico), lingua preferita, data di creazione dell'account.",
          "Dati dei contenuti: le intenzioni di preghiera che scegli di pubblicare e le interazioni di preghiera («Amen») ad esse collegate.",
          "Dati tecnici: cookie di sessione strettamente necessari per l'autenticazione. Non utilizziamo profilazione, pubblicità né tracker di analisi.",
        ],
      },
      {
        heading: "3. Categorie particolari di dati",
        paragraphs: [
          "Le intenzioni di preghiera possono rivelare convinzioni religiose o informazioni sulla salute, che costituiscono categorie particolari di dati personali ai sensi dell'art. 9 GDPR. Trattiamo tali dati solo perché li rendi deliberatamente pubblici sulla piattaforma (art. 9, par. 2, lett. e GDPR) al fine di ricevere preghiere dagli altri utenti. Condividi solo ciò che desideri rendere pubblico ed evita nomi completi o dettagli che identifichino altre persone.",
        ],
      },
      {
        heading: "4. Finalità e basi giuridiche",
        paragraphs: [""],
        bullets: [
          "Fornitura del servizio (account, pubblicazioni, notifiche): esecuzione di un contratto, art. 6, par. 1, lett. b GDPR.",
          "Moderazione dei contenuti e prevenzione degli abusi: legittimo interesse, art. 6, par. 1, lett. f GDPR.",
          "Adempimento di obblighi di legge: art. 6, par. 1, lett. c GDPR.",
        ],
      },
      {
        heading: "5. Conservazione dei dati",
        paragraphs: [
          "I tuoi dati sono conservati finché esiste il tuo account. Se elimini il tuo account, i dati dell'account, le tue intenzioni e le tue notifiche vengono eliminati immediatamente e definitivamente. Le copie di backup vengono sovrascritte nell'ambito della normale rotazione dei backup dei nostri fornitori di infrastruttura.",
        ],
      },
      {
        heading: "6. Responsabili del trattamento e trasferimenti",
        paragraphs: [
          "Utilizziamo Vercel Inc. (hosting) e Turso/Iku (hosting del database) come responsabili del trattamento. I dati possono essere trattati in data center all'interno e all'esterno dello Spazio Economico Europeo; i trasferimenti al di fuori del SEE sono protetti dalle Clausole Contrattuali Standard della Commissione Europea ai sensi dell'art. 46 GDPR. Se la generazione di preghiere o la traduzione assistita da IA è attiva, il testo di un'intenzione (mai i dati del tuo account) può essere trattato da Anthropic.",
          "Se scegli «Accedi con Google» o «Accedi con Apple», il rispettivo provider ci conferma la tua identità e ci comunica il tuo indirizzo email; non riceviamo mai la password del provider. La registrazione può essere protetta da Cloudflare Turnstile, che tratta dati tecnici di connessione per distinguere gli esseri umani dai bot (legittimo interesse, art. 6, par. 1, lett. f GDPR). Se attivi le notifiche push, viene conservato un indirizzo di recapito anonimo emesso dal fornitore del tuo browser, utilizzato esclusivamente per recapitare le tue notifiche. Le intenzioni ufficiali dell'account @PrayCircle si basano su dati pubblici di USGS e GDACS e non contengono dati personali.",
        ],
      },
      {
        heading: "7. I tuoi diritti",
        paragraphs: [
          `Ai sensi degli artt. 15–22 GDPR hai il diritto di accesso, rettifica, cancellazione, limitazione, opposizione e portabilità dei dati. Puoi esercitare tali diritti scrivendo a ${CONTACT}, oppure eliminare in qualsiasi momento il tuo account e tutti i dati associati dalla pagina Account. Hai inoltre il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it).`,
        ],
      },
      {
        heading: "8. Minori",
        paragraphs: [
          "In conformità all'art. 8 GDPR e all'art. 2-quinquies del Codice Privacy, il servizio può essere utilizzato autonomamente solo da persone di età pari o superiore a 14 anni. I minori di 14 anni possono utilizzarlo solo con il consenso di un genitore o tutore.",
        ],
      },
      {
        heading: "9. Modifiche",
        paragraphs: [
          "Potremmo aggiornare la presente informativa; le modifiche sostanziali saranno annunciate nell'app. La versione corrente è sempre disponibile su questa pagina.",
        ],
      },
    ],
  },
};

export default function PrivacyPage() {
  return <LegalPage content={content} />;
}
