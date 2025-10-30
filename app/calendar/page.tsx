import IslamicCalendarFull from "@/components/islamic-calendar-full";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Islamic Calendar - Manacaud Jamath",
  description: "12-month Hijri calendar with Gregorian dates and key events",
};

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900">Islamic Calendar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              12-month Hijri view with Gregorian dates • Subject to moon sighting
            </p>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="size-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Full Calendar */}
        <IslamicCalendarFull />
      </div>
    </div>
  );
}
