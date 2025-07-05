-- Add unique constraint for attendance to prevent duplicate records
-- This allows upsert operations to work properly
ALTER TABLE public.attendance 
ADD CONSTRAINT attendance_student_date_user_unique 
UNIQUE (student_id, date, user_id);