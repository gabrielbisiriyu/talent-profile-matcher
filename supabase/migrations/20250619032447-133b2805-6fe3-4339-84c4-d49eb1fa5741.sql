
-- Add missing columns to the candidates table to store all the parsed CV data
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS email_from_cv TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS work_experience JSONB,
ADD COLUMN IF NOT EXISTS certifications TEXT[];

-- Update the existing education column to store structured data if needed
-- (keeping it as TEXT for now since it might already have data)

-- Add any missing columns that might be needed
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS cv_hash TEXT UNIQUE;
