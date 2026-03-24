"use client";

import { useEffect, useState } from "react";
import { getLanguage, messages, Language } from "@/app/lib/i18n";

export function useLanguage() {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    setLang(getLanguage());
  }, []);

  return {
    lang,
    t: messages[lang],
  };
}