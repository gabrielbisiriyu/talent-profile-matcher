
-- First, drop the existing tables to recreate them with the correct structure
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create user profiles table with email instead of phone
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_type TEXT NOT NULL CHECK (user_type IN ('candidate', 'company')),
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  email TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create candidates table - fields will be auto-populated from CV parsing
CREATE TABLE public.candidates (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  cv_file_url TEXT, -- URL to the uploaded CV file for viewing
  cv_file_name TEXT, -- Original filename of the uploaded CV
  cv_file_type TEXT, -- MIME type (application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, etc.)
  skills TEXT[], -- Auto-populated from CV parsing
  experience_years INTEGER, -- Auto-populated from CV parsing
  linkedin_url TEXT, -- Auto-populated from CV parsing
  github_url TEXT, -- Auto-populated from CV parsing
  education TEXT, -- Auto-populated from CV parsing
  bio TEXT, -- User can edit this manually
  portfolio_url TEXT, -- User can add this manually
  parsed_cv_data JSONB, -- Store the full parsed CV data from backend
  cv_embeddings JSONB, -- Store CV embeddings for matching
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create companies table for company-specific information
CREATE TABLE public.companies (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  company_description TEXT,
  industry TEXT,
  company_size TEXT,
  website_url TEXT,
  logo_url TEXT,
  founded_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create jobs table for job postings
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  skills_required TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  location TEXT,
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  remote_option BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  parsed_job_data JSONB, -- Store parsed job requirements
  job_embeddings JSONB, -- Store job embeddings for matching
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create applications table for job applications
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')),
  cover_letter TEXT,
  match_score DECIMAL(5,2), -- AI matching score between candidate and job
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for candidates table
CREATE POLICY "Users can view their own candidate profile" ON public.candidates
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own candidate profile" ON public.candidates
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own candidate profile" ON public.candidates
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Companies can view candidate profiles" ON public.candidates
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'company'
  ));

-- RLS Policies for companies table
CREATE POLICY "Users can view their own company profile" ON public.companies
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own company profile" ON public.companies
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own company profile" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Everyone can view company profiles" ON public.companies
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for jobs table
CREATE POLICY "Companies can manage their own jobs" ON public.jobs
  FOR ALL USING (auth.uid() = company_id);

CREATE POLICY "Everyone can view active jobs" ON public.jobs
  FOR SELECT TO authenticated USING (status = 'active');

-- RLS Policies for applications table
CREATE POLICY "Candidates can view/manage their own applications" ON public.applications
  FOR ALL USING (auth.uid() = candidate_id);

CREATE POLICY "Companies can view applications for their jobs" ON public.applications
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.jobs WHERE id = job_id AND company_id = auth.uid()
  ));

CREATE POLICY "Companies can update applications for their jobs" ON public.applications
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.jobs WHERE id = job_id AND company_id = auth.uid()
  ));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, first_name, last_name, company_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'candidate'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'company_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
