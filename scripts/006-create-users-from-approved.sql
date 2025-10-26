-- Create user accounts for all approved members who don't have one yet
INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  am.email,
  am.name,
  '$2b$10$placeholder', -- Placeholder hash; users can reset password on first login
  'member',
  now(),
  now()
FROM approved_members am
WHERE am.review_status = 'approved'
  AND am.email NOT IN (SELECT email FROM users)
ON CONFLICT (email) DO NOTHING;
