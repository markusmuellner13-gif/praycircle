"use client";

import { useApp } from "./AppProvider";
import type { Lang } from "@/lib/i18n";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  sections: LegalSection[];
}

export default function LegalPage({
  content,
}: {
  content: Record<Lang, LegalDoc>;
}) {
  const { lang } = useApp();
  const doc = content[lang];
  return (
    <div className="legal">
      <h1>{doc.title}</h1>
      <p className="updated">{doc.updated}</p>
      {doc.sections.map((section, i) => (
        <section key={i}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
          {section.bullets && (
            <ul>
              {section.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
