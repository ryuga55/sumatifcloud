-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN email text;

-- Update the trigger function to also store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    CASE WHEN NEW.email = 'admin@schoolsaas.com' THEN 'admin'::public.app_role ELSE 'user'::public.app_role END,
    CASE WHEN NEW.email = 'admin@schoolsaas.com' THEN true ELSE false END
  );
  RETURN NEW;
END;
$function$;