-- Add unique constraint to prevent duplicate scores
ALTER TABLE public.scores 
ADD CONSTRAINT unique_student_subject_category_assessment 
UNIQUE (student_id, subject_id, category_id, assessment_name);