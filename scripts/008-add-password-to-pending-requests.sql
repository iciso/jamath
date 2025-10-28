-- Add password_hash column to pending_requests table if it doesn't exist
ALTER TABLE pending_requests
ADD COLUMN IF NOT EXISTS password_hash TEXT;
