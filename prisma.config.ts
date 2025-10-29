model IslamicEvent {
  id            String   @id @default(cuid())
  title         String
  title_ml      String?
  hijriDate     String
  gregorianDate DateTime
  type          EventType
  description   String?
  isAnnual      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([gregorianDate])
  @@index([type])
}

enum EventType {
  HIJRI_MONTH
  EID
  RAMADAN_START
  LAYLAT_AL_QADR
  COMMUNITY_EVENT
}