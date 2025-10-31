// components/islamic-calendar-full.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface HijriMonth {
  month: string;
  year: string;
  startDate: string;
  events: string[];
}

// YOUR GOLDEN FALLBACK DATA (exact as you provided)
const fallbackCalendar = [
  { hijri_month: "Jumada I 1447", gregorian_range: "October 23, 2025 – November 21, 2025" },
  { hijri_month: "Jumada II 1447", gregorian_range: "November 22, 2025 – December 21, 2025" },
  { hijri_month: "Rajab 1447", gregorian_range: "December 22, 2025 – January 20, 2026" },
  { hijri_month: "Sha'ban 1447", gregorian_range: "January 21, 2026 – February 19, 2026" },
  { hijri_month: "Ramadan 1447", gregorian_range: "February 20, 2026 – March 20, 2026" },
  { hijri_month: "Shawwal 1447", gregorian_range: "March 21, 2026 – April 19, 2026" },
  { hijri_month: "Dhu al-Qa'dah 1447", gregorian_range: "April 20, 2026 – May 19, 2026" },
  { hijri_month: "Dhu al-Hijjah 1447", gregorian_range: "May 20, 2026 – June 18, 2026" },
  { hijri_month: "Muharram 1448", gregorian_range: "June 19, 2026 – July 18, 2026" },
  { hijri_month: "Safar 1448", gregorian_range: "July 19, 2026 – August 17, 2026" },
  { hijri_month: "Rabi al-Awwal 1448", gregorian_range: "August 18, 2026 – September 16, 2026" },
  { hijri_month: "Rabi al-Thani 1448", gregorian_range: "September 17, 2026 – October 16, 2026" },
];

// Malayalam Month Names
const monthNameML: Record<string, string> = {
  "Jumada I": "ജുമാദൽ ഊല",
  "Jumada II": "ജുമാദൽ ആഖിര",
  "Rajab": "റജബ്",
  "Sha'ban": "ശഅ്ബാൻ",
  "Ramadan": "റമദാൻ",
  "Shawwal": "ശവ്വാൽ",
  "Dhu al-Qa'dah": "ധുൽ ഖഅ്ദ",
  "Dhu al-Hijjah": "ധുൽ ഹിജ്ജ",
  "Muharram": "മുഹർറം",
  "Safar": "സഫർ",
  "Rabi al-Awwal": "റബീഉൽ അവ്വൽ",
  "Rabi al-Thani": "റബീഉൽ ആഖിർ",
};

// Event Translations
const eventTranslations = {
  en: {
    "Ramadan Begins": "Ramadan Begins",
    "Eid al-Fitr": "Eid al-Fitr",
    "Dhul-Hijjah": "Dhul-Hijjah",
    "Eid al-Adha (~10th)": "Eid al-Adha (~10th)",
    "Islamic New Year": "Islamic New Year",
    "12th: Mawlid an-Nabi (approx)": "12th: Mawlid an-Nabi (approx)",
  },
  ml: {
    "Ramadan Begins": "റമദാൻ ആരംഭം",
    "Eid al-Fitr": "ഈദുൽ ഫിത്വർ",
    "Dhul-Hijjah": "ധുൽ ഹിജ്ജ",
    "Eid al-Adha (~10th)": "ഈദുൽ അദ്ഹാ (~10)",
    "Islamic New Year": "ഹിജ്റ പുതുവർഷം",
    "12th: Mawlid an-Nabi (approx)": "12: മൗലിദ് (ഏകദേശം)",
  },
};

export default function IslamicCalendarFull() {
  const { lang } = useLanguage();
  const [months, setMonths] = useState<HijriMonth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = eventTranslations[lang];

    const calendarData: HijriMonth[] = fallbackCalendar.map((item, index) => {
      const [name, year] = item.hijri_month.includes("1447")
        ? [item.hijri_month.replace(" 1447", ""), "1447"]
        : [item.hijri_month.replace(" 1448", ""), "1448"];

      // Determine events
      const eventsEN: string[] = [];
      if (name.includes("Ramadan")) eventsEN.push("Ramadan Begins");
      if (name.includes("Shawwal")) eventsEN.push("Eid al-Fitr");
      if (name.includes("Dhu al-Hijjah")) {
        eventsEN.push("Dhul-Hijjah");
        eventsEN.push("Eid al-Adha (~10th)");
      }
      if (name.includes("Muharram")) eventsEN.push("Islamic New Year");
      if (name.includes("Rabi al-Awwal")) eventsEN.push("12th: Mawlid an-Nabi (approx)");

      return {
        month: lang === "ml" ? (monthNameML[name] || name) : name,
        year: `${year} AH`,
        startDate: item.gregorian_range,
        events: eventsEN.map(e => t[e as keyof typeof t] || e),
      };
    });

    setMonths(calendarData);
    setLoading(false);
  }, [lang]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="size-8 animate-spin text-green-600" />
        <p className="text-sm text-muted-foreground">
          {lang === "ml" ? "കലണ്ടർ ലോഡ് ചെയ്യുന്നു..." : "Loading Hijri Calendar..."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {months.map((m, i) => (
        <Card
          key={i}
          className={`
            overflow-hidden border-green-100 bg-white/90 shadow-sm 
            hover:shadow-md transition-all duration-300
            ${i === 0 ? "ring-2 ring-emerald-400 shadow-lg" : ""}
            ${m.events.length > 0 ? "ring-1 ring-emerald-200" : ""}
          `}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <p className="text-lg font-bold text-green-800">{m.month}</p>
                <p className="text-sm font-medium text-green-700">{m.year}</p>
                {i === 0 && (
                  <p className="text-xs font-semibold text-emerald-600 mt-1">
                    {lang === "ml" ? "നിലവിലെ മാസം" : "Current Month"}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground border-t pt-2">
                {m.startDate}
              </p>
              {m.events.length > 0 && (
                <div className="space-y-1 pt-2 border-t">
                  {m.events.map((e, j) => (
                    <p
                      key={j}
                      className="text-xs font-medium text-emerald-700 flex items-center gap-1"
                    >
                      {e}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
