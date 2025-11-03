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
  Beef,
  UsersRound, 
  Clock7, 
  Calendar, 
  FileDown, 
  HandCoins,
  HandHelping,
  Baby,      
  Heart,
  ReceiptIndianRupee,     
  Scale,     
  Target      
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
              <Card className="group border-green-100 bg-green-50/50 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 group-hover:scale-110 transition-transform">
                      <FileDown className="size-4" />
                    </div>
                    <CardTitle className="text-base text-green-800">Certificates & Letters</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground flex flex-col justify-between h-full space-y-4">
                  <p>
                    Apply for official Jamath documents:
                  </p>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <Baby className="size-5" />
                      </div>
                      <p className="text-xs text-center">Birth</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex size-8 items-center justify-center rounded-full bg-pink-100 text-pink-700">
                        <Heart className="size-5" />
                      </div>
                      <p className="text-xs text-center">Nikah</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <Scale className="size-5" />
                      </div>
                      <p className="text-xs text-center">Talaq</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex size-8 items-center justify-center rounded-full bg-gray-200 text-gray-700">
                        <Target className="size-5" />
                      </div>
                      <p className="text-xs text-center">Death</p>
                    </div>
                  </div>

                         <p className="text-muted-foreground leading-relaxed">
                You can apply for birth registration for newborns, marriage (Nikah) certificates, talaq documentation, and death certificates for Janaza records. All applications are reviewed by the committee within 48 hours for authenticity and compliance with Islamic principles.
              </p>

                  <div className="mt-auto">
                    <span className="text-emerald-600 font-semibold">Live Now!</span>
                    <Button variant="outline" size="sm" className="mt-2 w-full border-green-300 text-green-700 hover:bg-green-50">
                      Apply Now →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

          {/* Zakat */}
                   <Link href="/certificates" className="block">
              <Card className="group border-green-100 bg-green-50/50 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 group-hover:scale-110 transition-transform">
                      <FileDown className="size-4" />
                    </div>
                    <CardTitle className="text-base text-green-800">Zakat & Sadaqah</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground flex flex-col justify-between h-full space-y-4">
                  <p>
                    Give to Allah a beautiful loan: Quran 2:245 & 57:18
                  </p>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <HandHelping className="size-5" />
                      </div>
                      <p className="text-xs text-center">Zakat</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex size-8 items-center justify-center rounded-full bg-pink-100 text-pink-700">
                        <Beef className="size-5" />
                      </div>
                      <p className="text-xs text-center">Fi-sabil-illah</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <Building2 className="size-5" />
                      </div>
                      <p className="text-xs text-center">Masjid</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex size-8 items-center justify-center rounded-full bg-gray-200 text-gray-700">
                        <ReceiptIndianRupee className="size-5" />
                      </div>
                      <p className="text-xs text-center">Events</p>
                    </div>
                  </div>

                         <p className="text-muted-foreground leading-relaxed">
                 Give zakat and sadaqah transparently. May Allah SWT reward you for your support. All charities are reviewed by the committee within 2 bank working days to check and synchronize with bank records and with the accounts, before receipts are issued for you to download.
              </p>

                  <div className="mt-auto">
                    <span className="text-emerald-600 font-semibold">Live Now!</span>
                    <Button variant="outline" size="sm" className="mt-2 w-full border-green-300 text-green-700 hover:bg-green-50">
                      Donate Now →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
   




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
