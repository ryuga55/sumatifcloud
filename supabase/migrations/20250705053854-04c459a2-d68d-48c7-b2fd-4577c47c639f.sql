-- Insert test user data untuk testing approval flow
INSERT INTO public.profiles (user_id, full_name, role, is_approved, is_verified) VALUES 
('00000000-0000-0000-0000-000000000001', 'Test User Pending', 'user', false, false),
('00000000-0000-0000-0000-000000000002', 'Test User Approved', 'user', true, false);