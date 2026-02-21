
-- Create tutorials table
CREATE TABLE public.tutorials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  youtube_url text NOT NULL,
  thumbnail_url text,
  category text NOT NULL DEFAULT 'general',
  target_role text NOT NULL DEFAULT 'all',
  target_page text,
  is_featured boolean NOT NULL DEFAULT false,
  is_important boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

-- Create tutorial_views table
CREATE TABLE public.tutorial_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutorial_id uuid NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  watched_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate views
CREATE UNIQUE INDEX idx_tutorial_views_unique ON public.tutorial_views(tutorial_id, user_id);

-- Indexes for performance
CREATE INDEX idx_tutorials_active_role ON public.tutorials(is_active, target_role);
CREATE INDEX idx_tutorials_category ON public.tutorials(category);
CREATE INDEX idx_tutorials_target_page ON public.tutorials(target_page) WHERE target_page IS NOT NULL;
CREATE INDEX idx_tutorial_views_user ON public.tutorial_views(user_id);

-- Enable RLS
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_views ENABLE ROW LEVEL SECURITY;

-- RLS for tutorials: anyone can view active tutorials
CREATE POLICY "Anyone can view active tutorials"
  ON public.tutorials FOR SELECT
  USING (is_active = true);

-- Admins can do everything with tutorials
CREATE POLICY "Admins can manage all tutorials"
  ON public.tutorials FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- RLS for tutorial_views: users can insert their own views
CREATE POLICY "Users can insert their own views"
  ON public.tutorial_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own view history
CREATE POLICY "Users can view their own history"
  ON public.tutorial_views FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all tutorial views
CREATE POLICY "Admins can view all tutorial views"
  ON public.tutorial_views FOR SELECT
  USING (get_user_role() = 'admin');

-- Create storage bucket for tutorial thumbnails
INSERT INTO storage.buckets (id, name, public) VALUES ('tutorial-thumbnails', 'tutorial-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for tutorial thumbnails
CREATE POLICY "Anyone can view tutorial thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tutorial-thumbnails');

CREATE POLICY "Admins can upload tutorial thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tutorial-thumbnails' AND get_user_role() = 'admin');

CREATE POLICY "Admins can update tutorial thumbnails"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tutorial-thumbnails' AND get_user_role() = 'admin');

CREATE POLICY "Admins can delete tutorial thumbnails"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tutorial-thumbnails' AND get_user_role() = 'admin');
