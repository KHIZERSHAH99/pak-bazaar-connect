import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { markTutorialViewed, extractYouTubeId, fetchTutorials, getYouTubeThumbnail } from '@/lib/tutorials';

const TutorialDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const { data: tutorial, isLoading } = useQuery({
    queryKey: ['tutorial', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: related = [] } = useQuery({
    queryKey: ['tutorials-related', tutorial?.category, id],
    queryFn: () => fetchTutorials(profile?.role || undefined),
    select: (data: any[]) => data.filter((t) => t.category === tutorial?.category && t.id !== id).slice(0, 3),
    enabled: !!tutorial,
  });

  // Mark as viewed
  useEffect(() => {
    if (tutorial && user) {
      markTutorialViewed(tutorial.id, user.id);
    }
  }, [tutorial, user]);

  if (isLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3" /><div className="aspect-video bg-muted rounded-lg" /><div className="h-24 bg-muted rounded" /></div>;
  }

  if (!tutorial) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground font-poppins">Tutorial not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard/tutorials')}>Back to Tutorials</Button>
      </div>
    );
  }

  const videoId = extractYouTubeId(tutorial.youtube_url);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/dashboard/tutorials')} className="font-poppins">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tutorials
      </Button>

      {/* Video Player - opens on YouTube since iframe is blocked in preview */}
      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block aspect-video rounded-lg overflow-hidden bg-muted relative group cursor-pointer"
      >
        {videoId ? (
          <>
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={tutorial.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <span className="absolute bottom-3 left-3 text-white text-xs bg-black/60 px-2 py-1 rounded font-poppins">
              Watch on YouTube ↗
            </span>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-destructive-foreground">Invalid video URL</div>
        )}
      </a>

      {/* Title and info */}
      <div>
        <div className="flex items-start gap-2 flex-wrap mb-2">
          {tutorial.is_featured && <Badge className="bg-amber-500 text-white"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
          <Badge variant="outline">{tutorial.category}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-foreground font-poppins">{tutorial.title}</h1>
        {tutorial.description && (
          <p className="text-muted-foreground font-poppins mt-2 leading-relaxed">{tutorial.description}</p>
        )}
      </div>

      {/* Related tutorials */}
      {related.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground font-poppins">Related Tutorials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {related.map((r: any) => (
              <Card key={r.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/dashboard/tutorials/${r.id}`)}>
                <div className="aspect-video bg-muted">
                  <img src={r.thumbnail_url || getYouTubeThumbnail(r.youtube_url) || '/placeholder.svg'} alt={r.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm text-foreground font-poppins line-clamp-2">{r.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialDetail;
