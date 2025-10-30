"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

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
  9: ["Ramadan Begins"],
  10: ["Eid al-Fitr"],
  12: ["Dhul-Hijjah", "Eid al-Adha (~10th)"],
  1: ["Islamic New Year"],
};

export default function IslamicCalendarFull() {
  const [months, setMonths] = useState<HijriMonth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHijriMonths = async () => {
      try {
        // Get current Hijri
        const todayRes = await fetch("https://api.aladhan.com/v1/gToH?date=today");
        const todayData = await todayRes.json();
        const currentHijri = todayData.data.hijri;
        const currentMonth = parseInt(currentHijri.month.number);
        const currentYear = parseInt(currentHijri.year);

        const calendar: HijriMonth[] = [];

        for (let i = 0; i < 12; i++) {
          const hijriMonth = ((currentMonth + i - 2 + 12) % 12) + 1;
          const hijriYear = currentYear + Math.floor((currentMonth + i - 2) / 12);

          // Fetch 1st of this Hijri month
          const res = await fetch(`https://api.aladhan.com/v1/hToG/1-${month}-${year}`);
          const data = await res.json();

          if (data.code === 200) {
            const g = data.data.gregorian;
            const startDate = `${g.day} ${g.month.en} ${g.year}`;

            calendar.push({
              month: hijriMonths[hijriMonth - 1],
              year: `${hijriYear} AH`,
              startDate,
              events: keyEvents[hijriMonth] || [],
            });
          }
        }

        setMonths(calendar);
      } catch (error) {
        console.error("API Error:", error);
        // Fallback
        setMonths(hijriMonths.map((m, i) => ({
          month: m,
          year: "1447 AH",
          startDate: "Approx",
          events: [],
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchHijriMonths();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading accurate Hijri dates...</p>
      </div>
    );
  }

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
                <p className="text-lg font-bold text-green-800">{m.month}</p>
                <p className="text-sm font-medium text-green-700">{m.year}</p>
              </div>
              <p className="text-xs text-muted-foreground border-t pt-2">
                Starts ≈ {m.startDate}
              </p>
              {m.events.length > 0 && (
                <div className="space-y-1 pt-2 border-t">
                  {m.events.map((e, j) => (
                    <p key={j} className="text-xs font-medium text-emerald-700">✓ {e}</p>
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
