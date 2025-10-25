-- Rename pending_members table to approved_members
ALTER TABLE pending_members RENAME TO approved_members;

-- Rename the index if it exists
ALTER INDEX IF EXISTS idx_pending_members_phone RENAME TO idx_approved_members_phone;
