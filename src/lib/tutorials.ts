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
  display_order: number;
  duration_seconds: number | null;
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

// Format seconds to "M:SS"
export const formatDuration = (seconds: number | null | undefined): string | null => {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Extract YouTube video ID from various URL formats
export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Validate generic video URL (http/https)
export const isValidVideoUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

export const isValidYouTubeUrl = (url: string): boolean => isValidVideoUrl(url);

export const isDirectVideoFile = (url: string): boolean => {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/.test(pathname);
  } catch {
    return false;
  }
};

export const toEmbeddableVideoUrl = (url: string): string | null => {
  if (!isValidVideoUrl(url)) return null;
  if (isDirectVideoFile(url)) return url;
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}?rel=0`;
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/i);
  if (vimeoMatch?.[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  const dailymotionMatch = url.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/i);
  if (dailymotionMatch?.[1]) return `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}`;
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/i);
  if (loomMatch?.[1]) return `https://www.loom.com/embed/${loomMatch[1]}`;
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveMatch?.[1]) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  return url;
};

export const getYouTubeThumbnail = (url: string): string | null => {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

export type TutorialSortOption = 'featured' | 'newest' | 'popular';

// Fetch tutorials for users
export const fetchTutorials = async (userRole?: string, sort: TutorialSortOption = 'featured') => {
  let query = supabase
    .from('tutorials')
    .select('*')
    .eq('is_active', true);

  if (sort === 'featured') {
    query = query
      .order('is_featured', { ascending: false })
      .order('is_important', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
  } else if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  let results = data || [];
  if (userRole) {
    results = results.filter(
      (t: any) => t.target_role === 'all' || t.target_role === userRole
    );
  }
  return results;
};

// Fetch view counts for tutorials (admin)
export const fetchTutorialViewCounts = async (): Promise<Record<string, number>> => {
  const { data, error } = await supabase
    .from('tutorial_views')
    .select('tutorial_id');
  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching view counts:', error);
    return {};
  }
  const counts: Record<string, number> = {};
  (data || []).forEach((v: any) => {
    counts[v.tutorial_id] = (counts[v.tutorial_id] || 0) + 1;
  });
  return counts;
};

// Fetch watched tutorial IDs for a user
export const fetchUserWatchedTutorials = async (userId: string): Promise<Set<string>> => {
  const { data, error } = await supabase
    .from('tutorial_views')
    .select('tutorial_id')
    .eq('user_id', userId);
  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching watched tutorials:', error);
    return new Set();
  }
  return new Set((data || []).map((v: any) => v.tutorial_id));
};

// Fetch all tutorials for admin
export const fetchAllTutorials = async () => {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createTutorial = async (tutorial: Omit<Tutorial, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('tutorials')
    .insert(tutorial as any)
    .select()
    .single();
  if (error) throw error;
  return data;
};

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

export const deleteTutorial = async (id: string) => {
  const { error } = await supabase.from('tutorials').delete().eq('id', id);
  if (error) throw error;
};

export const markTutorialViewed = async (tutorialId: string, userId: string) => {
  const { error } = await supabase
    .from('tutorial_views')
    .upsert({ tutorial_id: tutorialId, user_id: userId, watched_at: new Date().toISOString() } as any, {
      onConflict: 'tutorial_id,user_id',
    });
  if (error) console.error('Error marking tutorial viewed:', error);
};

// Fetch tutorials for a specific page (contextual) with fallback
export const fetchPageTutorials = async (pagePath: string, userRole?: string) => {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*')
    .eq('is_active', true)
    .eq('target_page', pagePath);
  if (error) throw error;

  let results = data || [];
  if (userRole) {
    results = results.filter(
      (t: any) => t.target_role === 'all' || t.target_role === userRole
    );
  }

  // Fallback: if no page-specific tutorials, show "Getting Started"
  if (results.length === 0) {
    const { data: fallback } = await supabase
      .from('tutorials')
      .select('*')
      .eq('is_active', true)
      .eq('category', 'Getting Started')
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .limit(3);

    let fallbackResults = fallback || [];
    if (userRole) {
      fallbackResults = fallbackResults.filter(
        (t: any) => t.target_role === 'all' || t.target_role === userRole
      );
    }
    return fallbackResults;
  }

  return results;
};

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
