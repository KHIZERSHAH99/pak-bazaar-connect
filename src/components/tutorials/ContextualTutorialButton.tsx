import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchPageTutorials, extractYouTubeId, markTutorialViewed } from '@/lib/tutorials';

const ContextualTutorialButton: React.FC = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const { data: tutorials = [] } = useQuery({
    queryKey: ['page-tutorials', location.pathname, profile?.role],
    queryFn: () => fetchPageTutorials(location.pathname, profile?.role || undefined),
    enabled: !!profile,
  });

  if (tutorials.length === 0) return null;

  const current = tutorials[selectedIdx] as any;
  const videoId = current ? extractYouTubeId(current.youtube_url) : null;

  const handleOpen = () => {
    setOpen(true);
    if (current && user) markTutorialViewed(current.id, user.id);
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outline"
        size="sm"
        className="fixed bottom-6 right-6 z-40 shadow-lg font-poppins gap-2 bg-background"
      >
        <Video className="h-4 w-4" /> Watch Tutorial
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-poppins">{current?.title}</DialogTitle>
          </DialogHeader>
          {videoId && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`}
                title={current?.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {current?.description && (
            <p className="text-muted-foreground font-poppins text-sm">{current.description}</p>
          )}
          {tutorials.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {tutorials.map((t: any, i: number) => (
                <Button
                  key={t.id}
                  variant={i === selectedIdx ? 'default' : 'outline'}
                  size="sm"
                  className="font-poppins text-xs"
                  onClick={() => {
                    setSelectedIdx(i);
                    if (user) markTutorialViewed(t.id, user.id);
                  }}
                >
                  {t.title}
                </Button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContextualTutorialButton;
