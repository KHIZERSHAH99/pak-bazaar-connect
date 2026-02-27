-- Fix RLS on tutorial_views to allow authenticated users to insert/upsert their own views
DROP POLICY IF EXISTS "Users can insert their own views" ON public.tutorial_views;
DROP POLICY IF EXISTS "Users can update their own views" ON public.tutorial_views;
DROP POLICY IF EXISTS "Users can read their own views" ON public.tutorial_views;
DROP POLICY IF EXISTS "Admins can read all views" ON public.tutorial_views;

CREATE POLICY "Users can insert their own views"
ON public.tutorial_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own views"
ON public.tutorial_views
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can read views"
ON public.tutorial_views
FOR SELECT
USING (true);
