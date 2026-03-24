"use client";

import { useEffect, useState } from "react";
import { getLanguage, Language, setLanguage } from "@/app/lib/i18n";

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    setLang(getLanguage());
  }, []);

  function changeLang(next: Language) {
    setLang(next);
    setLanguage(next);
    window.location.reload();
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        className={lang === "en" ? "" : "secondary"}
        onClick={() => changeLang("en")}
      >
        EN
      </button>
      <button
        className={lang === "es" ? "" : "secondary"}
        onClick={() => changeLang("es")}
      >
        ES
      </button>
    </div>
  );
}