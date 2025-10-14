-- Backfill normalized_phone for existing profiles that have phone_number but missing normalized_phone
UPDATE profiles 
SET normalized_phone = normalize_pakistani_phone(phone_number)
WHERE phone_number IS NOT NULL 
  AND (normalized_phone IS NULL OR normalized_phone = '');

-- Add index on normalized_phone for faster phone login lookups
CREATE INDEX IF NOT EXISTS idx_profiles_normalized_phone ON profiles(normalized_phone);