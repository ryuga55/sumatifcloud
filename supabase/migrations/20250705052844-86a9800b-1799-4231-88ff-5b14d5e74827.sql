-- Add approval status to profiles table
ALTER TABLE public.profiles ADD COLUMN is_approved boolean DEFAULT false;

-- Update existing admin user to be auto-approved
UPDATE public.profiles SET is_approved = true WHERE role = 'admin';

-- Create admin-only policy for viewing all profiles
CREATE POLICY "Admins can view all profiles for approval" 
ON public.profiles 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

-- Create admin-only policy for updating approval status
CREATE POLICY "Admins can approve users" 
ON public.profiles 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'admin');