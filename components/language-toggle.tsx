// components/language-toggle.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === "en" ? "ml" : "en")}
      className="gap-2"
    >
      <Globe className="size-4" />
      {lang === "en" ? "മലയാളം" : "English"}
    </Button>
  );
}
