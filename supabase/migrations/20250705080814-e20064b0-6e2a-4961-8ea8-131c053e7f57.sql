
-- Update the attendance table constraint to match frontend values
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_status_check;

-- Add new constraint with lowercase Indonesian values that match the frontend
ALTER TABLE public.attendance ADD CONSTRAINT attendance_status_check 
CHECK (status IN ('hadir', 'sakit', 'izin', 'alfa', 'terlambat'));
