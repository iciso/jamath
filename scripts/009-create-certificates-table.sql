CREATE TABLE IF NOT EXISTS certificate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('birth', 'marriage', 'talaq', 'death')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'issued')),
  details JSONB NOT NULL,
  notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS issued_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES certificate_applications(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificate_applications_profile_id ON certificate_applications(profile_id);
CREATE INDEX IF NOT EXISTS idx_certificate_applications_status ON certificate_applications(status);
CREATE INDEX IF NOT EXISTS idx_issued_certificates_profile_id ON issued_certificates(profile_id);

CREATE OR REPLACE FUNCTION update_certificate_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_certificate_applications_updated_at ON certificate_applications;
CREATE TRIGGER trg_certificate_applications_updated_at
BEFORE UPDATE ON certificate_applications
FOR EACH ROW
EXECUTE FUNCTION update_certificate_applications_updated_at();
