import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import PrayerTimes from "@/components/prayer-times"

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      <header className="w-full border-b">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div aria-hidden className="size-8 rounded-md bg-primary" />
            <div>
              <p className="font-semibold text-balance">Manacaud Valiyapally Muslim Hanafi Jamath</p>
              <p className="text-muted-foreground text-xs">Community & Services</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/terms" className="text-sm hover:underline">
              Terms
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/join">
              <Button size="sm" className="bg-primary text-primary-foreground">
                Join
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-balance">Welcome to the Masjid Community</CardTitle>
            </CardHeader>
            <CardContent className="text-pretty leading-relaxed">
              <p className="text-muted-foreground">
                This is the official Jamath portal for our local Muslim community. Registered members can access
                services, events, certificates, and community support. Non-members can view the Masjid info and prayer
                times.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/join">
                  <Button className="bg-primary text-primary-foreground">Become a Member</Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/terms">
                  <Button variant="outline">Read Terms</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Prayer Times</CardTitle>
            </CardHeader>
            <CardContent>
              <PrayerTimes />
              <p className="text-xs text-muted-foreground mt-2">
                Contact the Masjid office if you notice any discrepancy.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className={cn("grid gap-4 md:grid-cols-3")}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Islamic Calendar</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              View upcoming Islamic months and key dates. (Coming soon)
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Certificates & Letters</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Apply for birth, marriage, talaq, or death certificates. (Coming soon)
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zakat & Sadaqah</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Manage donations and distributions transparently. (Coming soon) May Allah SWT reward you for your support
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground text-center whitespace-pre-line">
    © {new Date().getFullYear()} Manacaud Valiyapally Muslim Hanafi Jamath — Wakf Board Reg No. 3721/RA - TC
    41/2125, KRA-35 A, Kalipankulam, Trivandrum 695009.{'\n'}
    President: Sherief,  Secretary: Althaf Ali,  Treasurer: Riyaz.
  </div>
      </footer>
    </main>
  )
}
