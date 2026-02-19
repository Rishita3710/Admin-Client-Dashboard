-- ============================================================
-- Run this FULL script in Supabase SQL Editor
-- It fixes RLS recursion AND adds admin role management
-- ============================================================

-- Drop all old policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;

DROP POLICY IF EXISTS "Staff can view their assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Staff can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Staff can update their assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete" ON public.tasks;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Anyone logged in can view all profiles (needed for assignment dropdowns)
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update ANY profile (for role changes)
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================
-- TASKS POLICIES
-- ============================================================

-- Staff see only their tasks; Admins see all
CREATE POLICY "tasks_select"
  ON public.tasks FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Any logged-in user can create tasks
CREATE POLICY "tasks_insert"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Staff update own tasks; Admins update all
CREATE POLICY "tasks_update"
  ON public.tasks FOR UPDATE
  USING (
    assigned_to = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Only Admins can delete
CREATE POLICY "tasks_delete"
  ON public.tasks FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================
-- Make yourself Admin (replace with your email)
-- ============================================================
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
