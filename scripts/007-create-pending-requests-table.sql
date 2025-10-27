-- Create pending_requests table for new join submissions awaiting admin approval
CREATE TABLE IF NOT EXISTS pending_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_requests_phone ON pending_requests (phone);
