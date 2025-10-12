-- Initial schema: pending member requests
-- Run this script to set up the first table for onboarding.
-- v0 can execute scripts in this folder. Keep migrations additive.

CREATE TABLE IF NOT EXISTS pending_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
