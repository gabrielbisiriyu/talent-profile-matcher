
-- Add job_text column to the jobs table to store the full job description
ALTER TABLE public.jobs 
ADD COLUMN job_text TEXT;
