"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface HijriMonth {
  month: string;
  year: string;
  startDate: string;
  endDate?: string;
  events: string[];
}

// YOUR GOLDEN FALLBACK DATA
const fallbackCalendar = [
  { hijri_month: "Jumada-al-Ula 1447", gregorian_range: "October 23, 2025 – November 21, 2025" },
  { hijri_month: "Jumada-al-Akhirah 1447", gregorian_range: "November 22, 2025 – December 21, 2025" },
  { hijri_month: "Rajab 1447", gregorian_range: "December 22, 2025 – January 20, 2026" },
  { hijri_month: "Sha'ban 1447", gregorian_range: "January 21, 2026 – February 19, 2026" },
  { hijri_month: "Ramadan 1447", gregorian_range: "February 20, 2026 – March 20, 2026" },
  { hijri_month: "Shawwal 1447", gregorian_range: "March 21, 2026 – April 19, 2026" },
  { hijri_month: "Dhu-al-Qa'dah 1447", gregorian_range: "April 20, 2026 – May 19, 2026" },
  { hijri_month: "Dhu-al-Hijjah 1447", gregorian_range: "May 20, 2026 – June 18, 2026" },
  { hijri_month: "Muharram 1448", gregorian_range: "June 19, 2026 – July 18, 2026" },
  { hijri_month: "Safar 1448", gregorian_range: "July 19, 2026 – August 17, 2026" },
  { hijri_month: "Rabi-al-Awwal 1448", gregorian_range: "August 18, 2026 – September 16, 2026" },
  { hijri_month: "Rabi-al-Thani 1448", gregorian_range: "September 17, 2026 – October 16, 2026" },
];

const hijriMonths = [
  "Muharram", "Safar", "Rabi'-al-Awwal", "Rabi'-al-Thani",
  "Jumada al-Ula", "Jumada-al-Akhirah", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhul-Qa'dah", "Dhul-Hijjah"
];

const keyEvents: Record<string, string[]> = {
  "Ramadan 1447": ["Ramadan Begins"],
  "Shawwal 1447": ["Eid al-Fitr"],
  "Dhu-al-Hijjah 1447": ["Dhul-Hijjah", "Eid al-Adha (~10th)"],
  "Muharram 1448": ["Islamic New Year"],
  "Rabi-al-Awwal 1448": ["12th: Mawlid an-Nabi (approx)"],
};

export default function IslamicCalendarFull() {
  const [months, setMonths] = useState<HijriMonth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Step 1: Load fallback immediately
    const fallbackMonths: HijriMonth[] = fallbackCalendar.map((item) => {
      const [monthName, year] = item.hijri_month.split(" ");
      const [start] = item.gregorian_range.split(" – ");
      return {
        month: monthName.replace("I", "al-Ula").replace("II", "al-Akhirah"),
        year: `${year} AH`,
        startDate: start,
        events: keyEvents[item.hijri_month] || [],
      };
    });
    setMonths(fallbackMonths);
    setLoading(false);

    // Step 2: Try API in background
    const tryLiveUpdate = async () => {
      try {
        const todayRes = await fetch("https://api.aladhan.com/v1/gToH?date=today", {
          cache: "no-store",
        });
        if (!todayRes.ok) return;

        const todayData = await todayRes.json();
        if (todayData.code !== 200) return;

        const currentHijri = todayData.data.hijri;
        const currentMonth = parseInt(currentHijri.month.number, 10);
        const currentYear = parseInt(currentHijri.year, 10);

        const liveMonths: HijriMonth[] = [];

        for (let i = 0; i < 12; i++) {
          const monthIndex = (currentMonth - 1 + i) % 12;
          const yearOffset = Math.floor((currentMonth - 1 + i) / 12);
          const targetYear = currentYear + yearOffset;
          const targetMonth = monthIndex + 1;

          const res = await fetch(
            `https://api.aladhan.com/v1/hToG?day=1&month=${targetMonth}&year=${targetYear}`,
            { cache: "no-store" }
          );

          let startDate = fallbackMonths[i].startDate;
          if (res.ok) {
            const data = await res.json();
            if (data.code === 200) {
              const g = data.data.gregorian;
              startDate = `${g.day} ${g.month.en} ${g.year}`;
            }
          }

          liveMonths.push({
            month: hijriMonths[monthIndex],
            year: `${targetYear} AH`,
            startDate,
            events: keyEvents[`${hijriMonths[monthIndex]} ${targetYear}`] || [],
          });
        }

        setMonths(liveMonths);
      } catch (err) {
        console.log("API failed, using accurate fallback");
      }
    };

    tryLiveUpdate();
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
                  <p className="text-xs font-semibold text-emerald-600 mt-1">Current Month</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground border-t pt-2">
                Starts approximately {m.startDate}
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
