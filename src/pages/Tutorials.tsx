import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Play, Star, BookOpen, Clock, Video } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchTutorials, getYouTubeThumbnail, formatDuration, getLocalizedField, toEmbeddableVideoUrl, isDirectVideoFile, TUTORIAL_CATEGORIES } from '@/lib/tutorials';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PublicTutorials: React.FC = () => {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTutorial, setSelectedTutorial] = useState<any>(null);

  const { data: tutorials = [], isLoading } = useQuery({
    queryKey: ['public-tutorials'],
    queryFn: () => fetchTutorials(undefined, 'featured'),
  });

  const filtered = tutorials.filter((t: any) => {
    const title = getLocalizedField(t, 'title', language) || '';
    const desc = getLocalizedField(t, 'description', language) || '';
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const embedUrl = selectedTutorial ? toEmbeddableVideoUrl(selectedTutorial.youtube_url) : null;
  const isDirectFile = selectedTutorial ? isDirectVideoFile(selectedTutorial.youtube_url) : false;

  const categories = ['all', ...TUTORIAL_CATEGORIES];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Video className="h-5 w-5" />
            <span className="font-poppins font-semibold text-sm">Learn How It Works</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-poppins mb-3">
            Platform Tutorials
          </h1>
          <p className="text-muted-foreground font-poppins max-w-2xl mx-auto">
            New to Pak Bazaar Connect? Watch these quick tutorials to learn how to browse products, 
            place orders, manage your shop, and grow your business.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tutorials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 font-poppins"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'outline'}
                size="sm"
                className="font-poppins text-xs capitalize"
                onClick={() => setCategoryFilter(cat)}
              >
                {cat === 'all' ? 'All' : cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground font-poppins">No tutorials found</p>
            <p className="text-sm text-muted-foreground font-poppins mt-1">Try a different search or category</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tutorial: any) => {
            const title = getLocalizedField(tutorial, 'title', language) || tutorial.title;
            const desc = getLocalizedField(tutorial, 'description', language) || tutorial.description;
            const thumb = tutorial.thumbnail_url || getYouTubeThumbnail(tutorial.youtube_url);
            const duration = formatDuration(tutorial.duration_seconds);

            return (
              <Card
                key={tutorial.id}
                className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30"
                onClick={() => setSelectedTutorial(tutorial)}
              >
                <div className="aspect-video relative bg-muted overflow-hidden">
                  {thumb ? (
                    <img src={thumb} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Video className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                  {/* Play overlay - always visible on mobile, hover on desktop */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <div className="bg-primary rounded-full p-2.5 md:p-3 shadow-lg">
                      <Play className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground fill-current" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  {duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-poppins flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {duration}
                    </div>
                  )}
                  {/* Featured badge */}
                  {tutorial.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px]">
                      <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-poppins font-semibold text-foreground line-clamp-2 mb-1 text-sm">
                    {title}
                  </h3>
                  {desc && (
                    <p className="text-xs text-muted-foreground font-poppins line-clamp-2">{desc}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px] font-poppins capitalize">
                      {tutorial.category}
                    </Badge>
                    {tutorial.target_role !== 'all' && (
                      <Badge variant="secondary" className="text-[10px] font-poppins capitalize">
                        {tutorial.target_role}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={!!selectedTutorial} onOpenChange={() => setSelectedTutorial(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-poppins">
              {selectedTutorial && (getLocalizedField(selectedTutorial, 'title', language) || selectedTutorial.title)}
            </DialogTitle>
          </DialogHeader>
          {embedUrl && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              {isDirectFile ? (
                <video src={embedUrl} controls autoPlay className="w-full h-full" preload="metadata" />
              ) : (
                <iframe
                  src={embedUrl}
                  title={selectedTutorial?.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              )}
            </div>
          )}
          {selectedTutorial?.description && (
            <p className="text-muted-foreground font-poppins text-sm">
              {getLocalizedField(selectedTutorial, 'description', language) || selectedTutorial.description}
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PublicTutorials;
