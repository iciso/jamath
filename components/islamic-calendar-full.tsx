"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface HijriMonth {
  month: string;
  year: string;
  startDate: string;
  events: string[];
}

const hijriMonths = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhul-Qi'dah", "Dhul-Hijjah"
];

const keyEvents: Record<number, string[]> = {
  1: ["Islamic New Year"],
  9: ["Ramadan Begins"],
  10: ["Eid al-Fitr"],
  12: ["Dhul-Hijjah", "Eid al-Adha (~10th)"],
  3: ["12th: Mawlid an-Nabi (approx)"],
};

export default function IslamicCalendarFull() {
  const [months, setMonths] = useState<HijriMonth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHijriCalendar = async () => {
      try {
        // Step 1: Get current Hijri
        const todayRes = await fetch("https://api.aladhan.com/v1/gToH?date=today");
        if (!todayRes.ok) throw new Error("Network error");
        const todayData = await todayRes.json();
        if (todayData.code !== 200) throw new Error("Invalid response");

        const currentHijri = todayData.data.hijri;
        const currentMonth = parseInt(currentHijri.month.number, 10);
        const currentYear = parseInt(currentHijri.year, 10);

        const calendar: HijriMonth[] = [];

        for (let i = 0; i < 12; i++) {
          const offset = i - 2;
          const targetMonth = ((currentMonth + offset - 1 + 12) % 12) + 1;
          const targetYear = currentYear + Math.floor((currentMonth + offset - 1) / 12);

          // CORRECT URL: 1-month-year with DASHES
          const res = await fetch(
            `https://api.aladhan.com/v1/hToG/1-${targetMonth}-${targetYear}`
          );
          if (!res.ok) throw new Error("Network error");

          const data = await res.json();
          let startDate = "Approx";

          if (data.code === 200) {
            const g = data.data.gregorian;
            startDate = `${g.day} ${g.month.en} ${g.year}`;
          }

          calendar.push({
            month: hijriMonths[targetMonth - 1],
            year: `${targetYear} AH`,
            startDate,
            events: keyEvents[targetMonth] || [],
          });
        }

        setMonths(calendar);
      } catch (err) {
        console.warn("Using fallback calendar:", err);
        // Fallback dates
        const fallback = [
          "20 Oct 2025", "19 Nov 2025", "18 Dec 2025", "16 Jan 2026",
          "15 Feb 2026", "16 Mar 2026", "15 Apr 2026", "14 May 2026",
          "13 Jun 2026", "13 Jul 2026", "11 Aug 2026", "10 Sep 2026"
        ];
        setMonths(hijriMonths.map((m, i) => ({
          month: m,
          year: `1447 AH`,
          startDate: fallback[i % 12],
          events: keyEvents[i + 1] || [],
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchHijriCalendar();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="size-8 animate-spin text-green-600" />
        <p className="text-sm text-muted-foreground">Loading Hijri Calendar...</p>
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
            ${m.events.length > 0 ? "ring-1 ring-emerald-200" : ""}
          `}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <p className="text-lg font-bold text-green-800">{m.month}</p>
                <p className="text-sm font-medium text-green-700">{m.year}</p>
              </div>
              <p className="text-xs text-muted-foreground border-t pt-2">
                Starts ≈ {m.startDate}
              </p>
              {m.events.length > 0 && (
                <div className="space-y-1 pt-2 border-t">
                  {m.events.map((e, j) => (
                    <p key={j} className="text-xs font-medium text-emerald-700 flex items-center gap-1">
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
