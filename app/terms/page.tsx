export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-balance">Membership Terms & Conditions</h1>
      <ol className="mt-4 list-decimal pl-5 space-y-2 leading-relaxed">
        <li>Members must reside in the local neighborhood served by the Masjid.</li>
        <li>A valid phone number is mandatory; email is optional.</li>
        <li>Members agree to adhere to Islamic principles and Masjid guidelines.</li>
        <li>Respect and modesty are expected in all interactions, including chat.</li>
        <li>Only same-sex private chat is permitted within the app.</li>
        <li>Misuse may lead to suspension or termination of membership by the committee.</li>
        <li>Data provided will be used solely for community services, as per local laws.</li>
      </ol>
      <p className="mt-6 text-sm text-muted-foreground">
        Note: The Jamath committee is the final custodian of membership approvals and services.
      </p>
    </main>
  )
}
