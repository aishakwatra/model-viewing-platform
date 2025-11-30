-- Make sure admin user is approved and has correct role
-- Run this in your Supabase SQL Editor

-- Update the admin user to be approved
UPDATE users 
SET is_approved = true, 
    user_role_id = 3  -- Admin role
WHERE email = 'themelodium@gmail.com';

-- Verify the update
SELECT 
  user_id,
  email,
  full_name,
  user_role_id,
  is_approved,
  auth_user_id
FROM users 
WHERE email = 'themelodium@gmail.com';
