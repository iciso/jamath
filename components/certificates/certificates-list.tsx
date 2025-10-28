"use client"

import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CertificatesListProps {
  profileId: string
}

export function CertificatesList({ profileId }: CertificatesListProps) {
  const { data: certificates, isLoading } = useSWR(`/api/certificates?profileId=${profileId}`, (url) =>
    fetch(url).then((r) => r.json()),
  )

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>
  if (!certificates?.length) return <p className="text-muted-foreground">No certificates yet</p>

  return (
    <div className="grid gap-4">
      {certificates.map((cert: any) => (
        <Card key={cert.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold capitalize">{cert.certificate_type} Certificate</p>
              <p className="text-sm text-muted-foreground">Status: {cert.status}</p>
              {cert.certificate_number && (
                <p className="text-sm text-muted-foreground">Certificate #: {cert.certificate_number}</p>
              )}
            </div>
            {cert.status === "issued" && (
              <Button size="sm" onClick={() => window.open(`/api/certificates/download?id=${cert.id}`, "_blank")}>
                Download
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
