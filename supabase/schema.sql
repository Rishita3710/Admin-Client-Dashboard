-- ============================================================
-- CLIENT TASK DASHBOARD — Supabase Schema + RLS
-- Run this entire file in your Supabase SQL editor
-- ============================================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. Tasks table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  client_name TEXT,
  matter_ref TEXT,           -- Financial firm: matter/case reference number
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. RLS Policies for tasks
-- ============================================================

-- STAFF: Can SELECT only their assigned tasks
CREATE POLICY "Staff can view their assigned tasks"
  ON public.tasks FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- STAFF: Can INSERT tasks (created_by themselves)
CREATE POLICY "Staff can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
  );

-- STAFF: Can UPDATE only their assigned tasks
CREATE POLICY "Staff can update their assigned tasks"
  ON public.tasks FOR UPDATE
  USING (
    assigned_to = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ADMIN ONLY: Can DELETE any task
CREATE POLICY "Admins can delete tasks"
  ON public.tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 4. Updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. Seed: Make first signed-up user an admin (optional)
-- Run after your first login:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ============================================================

-- 6. Sample data (optional — replace UUIDs with real ones after setup)
-- INSERT INTO public.tasks (title, description, status, priority, client_name, matter_ref, due_date, assigned_to, created_by)
-- VALUES ('Review Q4 Financial Report', 'Audit client Q4 statements for compliance', 'in_progress', 'high', 'Acme Corp', 'ACM-2024-001', NOW() + INTERVAL '3 days', '<staff_uuid>', '<admin_uuid>');
