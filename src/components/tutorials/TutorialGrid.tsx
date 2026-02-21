import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Play, Star, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTutorials, getYouTubeThumbnail, TUTORIAL_CATEGORIES, type Tutorial } from '@/lib/tutorials';
import { useNavigate } from 'react-router-dom';

const TutorialGrid: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: tutorials = [], isLoading } = useQuery({
    queryKey: ['tutorials', profile?.role],
    queryFn: () => fetchTutorials(profile?.role || undefined),
  });

  const filtered = tutorials.filter((t: any) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const featured = filtered.filter((t: any) => t.is_featured);
  const regular = filtered.filter((t: any) => !t.is_featured);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-poppins flex items-center gap-2">
          <BookOpen className="h-6 w-6" /> Tutorials
        </h1>
        <p className="text-muted-foreground font-poppins text-sm mt-1">
          Learn how to use PBC platform step by step
        </p>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tutorials..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 font-poppins" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44 font-poppins">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {TUTORIAL_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground font-poppins mb-1">No tutorials found</h3>
            <p className="text-muted-foreground font-poppins text-sm">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Featured */}
          {featured.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground font-poppins flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" /> Featured
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((t: any) => (
                  <TutorialCard key={t.id} tutorial={t} onClick={() => navigate(`/dashboard/tutorials/${t.id}`)} />
                ))}
              </div>
            </div>
          )}

          {/* Regular */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regular.map((t: any) => (
              <TutorialCard key={t.id} tutorial={t} onClick={() => navigate(`/dashboard/tutorials/${t.id}`)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const TutorialCard: React.FC<{ tutorial: any; onClick: () => void }> = ({ tutorial, onClick }) => {
  const thumbnail = tutorial.thumbnail_url || getYouTubeThumbnail(tutorial.youtube_url) || '/placeholder.svg';

  return (
    <Card className="overflow-hidden cursor-pointer group hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img src={thumbnail} alt={tutorial.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        <div className="absolute inset-0 bg-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-3">
            <Play className="h-6 w-6 text-foreground fill-current" />
          </div>
        </div>
        {tutorial.is_featured && (
          <Badge className="absolute top-2 left-2 bg-amber-500 text-white text-[10px]">
            <Star className="h-2.5 w-2.5 mr-0.5" /> Featured
          </Badge>
        )}
        {tutorial.is_important && (
          <Badge variant="destructive" className="absolute top-2 right-2 text-[10px]">Important</Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground font-poppins line-clamp-2 mb-1">{tutorial.title}</h3>
        {tutorial.description && (
          <p className="text-muted-foreground text-sm font-poppins line-clamp-2 mb-2">{tutorial.description}</p>
        )}
        <Badge variant="outline" className="text-[10px] font-poppins">{tutorial.category}</Badge>
      </CardContent>
    </Card>
  );
};

export default TutorialGrid;
