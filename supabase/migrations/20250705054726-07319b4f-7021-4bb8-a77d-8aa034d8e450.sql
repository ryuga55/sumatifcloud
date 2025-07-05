-- Remove license system from database
DROP TABLE IF EXISTS public.license_keys;

-- Remove license_key column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS license_key;