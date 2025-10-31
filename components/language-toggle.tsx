// components/language-toggle.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const translations = {
  en: {
    title: "Islamic Calendar",
    subtitle: "12-month Hijri calendar with Gregorian dates • Subject to moon sighting",
    current: "Current Month",
    starts: "Starts approximately",
    events: {
      "Ramadan Begins": "Ramadan Begins",
      "Eid al-Fitr": "Eid al-Fitr",
      "Dhul-Hijjah": "Dhul-Hijjah",
      "Eid al-Adha (~10th)": "Eid al-Adha (~10th)",
      "Islamic New Year": "Islamic New Year",
      "12th: Mawlid an-Nabi (approx)": "12th: Mawlid an-Nabi (approx)",
    },
  },
  ml: {
    title: "ഇസ്ലാമിക് കലണ്ടർ",
    subtitle: "12 മാസത്തെ ഹിജ്റ കലണ്ടർ • ചന്ദ്രദർശനം അനുസരിച്ച്",
    current: "നിലവിലെ മാസം",
    starts: "ആരംഭം ≈",
    events: {
      "Ramadan Begins": "റമദാൻ ആരംഭം",
      "Eid al-Fitr": "ഈദുൽ ഫിത്വർ",
      "Dhul-Hijjah": "ധുൽ ഹിജ്ജ",
      "Eid al-Adha (~10th)": "ഈദുൽ അദ്ഹാ (~10)",
      "Islamic New Year": "ഹിജ്റ പുതുവർഷം",
      "12th: Mawlid an-Nabi (approx)": "12: മൗലിദ് (ഏകദേശം)",
    },
  },
};

export default function LanguageToggle() {
  const [lang, setLang] = useState<"en" | "ml">("en");

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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
