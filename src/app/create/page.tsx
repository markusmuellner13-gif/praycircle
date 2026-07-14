"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import Composer from "@/components/Composer";

export default function CreatePage() {
  const { t } = useApp();
  const router = useRouter();

  return (
    <>
      <h1 className="page-title">{t.createIntention}</h1>
      <p className="page-sub">🕯️ {t.createHint}</p>
      <Composer onCreated={() => router.push("/")} />
    </>
  );
}
