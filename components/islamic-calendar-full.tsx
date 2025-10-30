"use client";

import { useEffect, useState } from "react";
import { format, addMonths } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface HijriMonth {
  month: string;
  year: string;
  gregorian: string;
  events: string[];
}

const hijriMonths = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhul-Qi'dah", "Dhul-Hijjah"
];

const keyEvents: Record<number, string[]> = {
  9: ["Ramadan Begins (~19 Feb)"],
  10: ["Eid al-Fitr (~20 Mar)"],
  12: ["Dhul-Hijjah (~18 May)", "Eid al-Adha (~27 May)"],
  1: ["Muharram 1448 (~7 Jul)"],
};

export default function IslamicCalendarFull() {
  const [months, setMonths] = useState<HijriMonth[]>([]);

  useEffect(() => {
    // Get current Hijri — FIXED URL
    fetch("https://api.aladhan.com/v1/gToH?date=today")
      .then(r => r.json())
      .then(d => {
        const h = d.data.hijri;
        const currentMonth = parseInt(h.month.number);
        const currentYear = parseInt(h.year);

        const calendar: HijriMonth[] = [];

        for (let i = 0; i < 12; i++) {
          const monthIdx = (currentMonth + i - 1) % 12;
          const yearOffset = currentMonth + i > 12 ? 1 : 0;
          const hijriYear = currentYear + yearOffset;

          const approxGregorian = format(
            addMonths(new Date(), i),
            "MMM yyyy"
          );

          calendar.push({
            month: hijriMonths[monthIdx],
            year: `${hijriYear} AH`,
            gregorian: approxGregorian,
            events: keyEvents[monthIdx + 1] || [],
          });
        }

        setMonths(calendar);
      })
      .catch(() => {
        // Fallback: Show static months
        setMonths(hijriMonths.map((month, i) => ({
          month,
          year: "1447 AH",
          gregorian: format(addMonths(new Date(), i), "MMM yyyy"),
          events: keyEvents[i + 1] || [],
        })));
      });
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {months.map((m, i) => (
        <Card
          key={i}
          className="overflow-hidden border-green-100 bg-white/80 shadow-sm hover:shadow-md transition-all"
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <p className="text-lg font-bold text-green-800">
                  {m.month}
                </p>
                <p className="text-sm font-medium text-green-700">
                  {m.year}
                </p>
              </div>
              <p className="text-xs text-muted-foreground border-t pt-2">
                ≈ {m.gregorian}
              </p>
              {m.events.length > 0 && (
                <div className="space-y-1 pt-2 border-t">
                  {m.events.map((e, j) => (
                    <p key={j} className="text-xs font-medium text-emerald-700">
                      ✓ {e}
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
