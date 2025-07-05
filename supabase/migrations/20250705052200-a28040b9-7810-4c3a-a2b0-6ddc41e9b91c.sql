-- Add missing role column to profiles table
ALTER TABLE public.profiles ADD COLUMN role public.app_role DEFAULT 'user'::public.app_role;

-- Create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    CASE WHEN NEW.email = 'admin@schoolsaas.com' THEN 'admin'::public.app_role ELSE 'user'::public.app_role END
  );
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS public.app_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE profiles.user_id = $1;
$$;