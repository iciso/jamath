import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import IslamicCalendar from "@/components/islamic-calendar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import PrayerTimes from "@/components/prayer-times"
import { AuthButton } from "@/components/auth-button"
import { useLocale } from 'next-intl'

import { 
  Building2, 
  UsersRound, 
  Clock7, 
  Calendar, 
  FileDown, 
  HandCoins 
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-green-50/30 to-white">
      {/* === HEADER === */}
      <header className="w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-600 text-white shadow-sm ring-1 ring-green-700/20">
              <Building2 className="size-6" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight text-green-900">
                Manacaud Valiyapally Muslim Hanafi Jamath
              </p>
              <p className="text-sm text-green-700 font-medium">
                Community & Services
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <AuthButton />
            <Link href="/join">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                Join
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* === HERO SECTION === */}
      <section className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {/* Welcome Card */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <UsersRound className="size-5" />
                </div>
                <CardTitle className="text-xl text-green-900">Welcome to the Masjid Community</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                This is the official Jamath portal for our local Muslim community. Registered members can access
                services, events, certificates, and community support. Non-members can view the Masjid info and prayer
                times.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/join">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Become a Member
                  </Button>
                </Link>
                <AuthButton />
                <Link href="/terms">
                  <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                    Read Terms
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Prayer Times Card */}
          <Card className="border-green-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Clock7 className="size-5" />
                </div>
                <CardTitle className="text-xl text-green-900">Today's Prayer Times</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
             <PrayerTimes locale="en" />
               <p className="text-xs text-center text-muted-foreground mt-3 italic">
                Contact the Masjid office if you notice any discrepancy.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* === FEATURES SECTION === */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {/* Islamic Calendar */}
            <IslamicCalendar />
       
          {/* Certificates */}
            <Link href="/certificates" className="block">
              <Card className="group border-green-100 bg-green-50/50 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 group-hover:scale-110 transition-transform">
                      <FileDown className="size-4" />
                    </div>
                    <CardTitle className="text-base text-green-800">Certificates & Letters</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Apply for birth, marriage, talaq, or death certificates.{" "}
                  <span className="text-emerald-600 font-semibold">Live Now!</span>
                </CardContent>
              </Card>
            </Link>

          {/* Zakat */}
          <Card className="group border-green-100 bg-green-50/50 hover:bg-green-50 hover:border-green-300 transition-all">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 group-hover:scale-110 transition-transform">
                  <HandCoins className="size-4" />
                </div>
                <CardTitle className="text-base text-green-800">Zakat & Sadaqah</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Manage donations and distributions transparently. May Allah SWT reward you for your support. <span className="text-green-600 font-medium">(Coming soon)</span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* === FOOTER ===   */}
      <footer className="border-t bg-green-50/50">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center">
          <p className="text-sm text-green-700 font-medium">
            © {new Date().getFullYear()} 
            
            <span>
            {" "}
            <a
              href="https://manacaudvaliyapally.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Manacaud Valiyapally Muslim Hanafi Jamath
            </a>{" "}
            at +91 4712455824
          </span>

          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Wakf Board Reg No. 3721/RA - TC 41/2125, KRA-35 A, Kalipankulam, Trivandrum 695009
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            President: Sherief • Secretary: Althaf Ali • Treasurer: Riyaz
          </p>
        </div>
      </footer>
    </main>
  )
}
