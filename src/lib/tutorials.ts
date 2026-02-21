import { supabase } from '@/integrations/supabase/client';

export interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  thumbnail_url: string | null;
  category: string;
  target_role: string;
  target_page: string | null;
  is_featured: boolean;
  is_important: boolean;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
}

export const TUTORIAL_CATEGORIES = [
  'Getting Started',
  'Shops',
  'Products',
  'Orders',
  'Payments',
  'Shipping',
  'Account',
  'General',
] as const;

export const TUTORIAL_TARGET_ROLES = [
  { value: 'all', label: 'Everyone' },
  { value: 'seller', label: 'Seller' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'admin', label: 'Admin' },
] as const;

// Extract YouTube video ID from various URL formats
export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Validate YouTube URL
export const isValidYouTubeUrl = (url: string): boolean => {
  return extractYouTubeId(url) !== null;
};

// Get YouTube thumbnail from video ID
export const getYouTubeThumbnail = (url: string): string | null => {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

// Fetch tutorials for users (filtered by role)
export const fetchTutorials = async (userRole?: string) => {
  let query = supabase
    .from('tutorials')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('is_important', { ascending: false })
    .order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  // Filter by role client-side (since target_role can be 'all' or specific)
  if (userRole) {
    return (data || []).filter(
      (t: any) => t.target_role === 'all' || t.target_role === userRole
    );
  }
  return data || [];
};

// Fetch all tutorials for admin
export const fetchAllTutorials = async () => {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// Create tutorial
export const createTutorial = async (tutorial: Omit<Tutorial, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('tutorials')
    .insert(tutorial as any)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update tutorial
export const updateTutorial = async (id: string, updates: Partial<Tutorial>) => {
  const { data, error } = await supabase
    .from('tutorials')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Delete tutorial
export const deleteTutorial = async (id: string) => {
  const { error } = await supabase.from('tutorials').delete().eq('id', id);
  if (error) throw error;
};

// Mark tutorial as viewed
export const markTutorialViewed = async (tutorialId: string, userId: string) => {
  const { error } = await supabase
    .from('tutorial_views')
    .upsert({ tutorial_id: tutorialId, user_id: userId, watched_at: new Date().toISOString() } as any, {
      onConflict: 'tutorial_id,user_id',
    });
  if (error) console.error('Error marking tutorial viewed:', error);
};

// Fetch tutorials for a specific page (contextual)
export const fetchPageTutorials = async (pagePath: string, userRole?: string) => {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*')
    .eq('is_active', true)
    .eq('target_page', pagePath);
  if (error) throw error;

  if (userRole) {
    return (data || []).filter(
      (t: any) => t.target_role === 'all' || t.target_role === userRole
    );
  }
  return data || [];
};

// Upload thumbnail
export const uploadTutorialThumbnail = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from('tutorial-thumbnails')
    .upload(fileName, file);
  if (error) throw error;

  const { data } = supabase.storage
    .from('tutorial-thumbnails')
    .getPublicUrl(fileName);
  return data.publicUrl;
};
