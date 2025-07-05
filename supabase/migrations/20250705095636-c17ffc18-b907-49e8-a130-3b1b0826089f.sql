-- Create daily_journals table for teacher's daily journal entries
CREATE TABLE public.daily_journals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  class_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  material TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('ceramah', 'diskusi', 'praktik', 'presentasi', 'tanya_jawab', 'demonstrasi', 'eksperimen', 'game_edukasi')),
  students_present INTEGER NOT NULL DEFAULT 0,
  teacher_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.daily_journals ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own daily journals" 
ON public.daily_journals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily journals" 
ON public.daily_journals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily journals" 
ON public.daily_journals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily journals" 
ON public.daily_journals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_daily_journals_updated_at
BEFORE UPDATE ON public.daily_journals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();