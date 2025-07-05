-- Update handle_new_user function to auto-approve admin users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    CASE WHEN NEW.email = 'admin@schoolsaas.com' THEN 'admin'::public.app_role ELSE 'user'::public.app_role END,
    CASE WHEN NEW.email = 'admin@schoolsaas.com' THEN true ELSE false END
  );
  RETURN NEW;
END;
$$;