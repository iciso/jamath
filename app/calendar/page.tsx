// app/calendar/page.tsx
import IslamicCalendarFull from "@/components/islamic-calendar-full";
import { LanguageProvider } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Globe } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

function LanguageToggle() {
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

export default function CalendarPage() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-900">Islamic Calendar</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                12-month Hijri calendar with Gregorian dates • Subject to moon sighting
              </p>
            </div>
            <div className="flex gap-2">
              <LanguageToggle />
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
          <IslamicCalendarFull />
        </div>
      </div>
    </LanguageProvider>
  );
}
