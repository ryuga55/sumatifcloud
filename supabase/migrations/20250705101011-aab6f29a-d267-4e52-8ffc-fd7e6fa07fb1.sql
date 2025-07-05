-- Add foreign key constraints to daily_journals table
ALTER TABLE public.daily_journals 
ADD CONSTRAINT daily_journals_class_id_fkey 
FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

ALTER TABLE public.daily_journals 
ADD CONSTRAINT daily_journals_subject_id_fkey 
FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;