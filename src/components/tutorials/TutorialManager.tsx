import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Edit2, Trash2, Play, Star, AlertCircle, Filter, Eye } from 'lucide-react';
import {
  fetchAllTutorials,
  createTutorial,
  updateTutorial,
  deleteTutorial,
  uploadTutorialThumbnail,
  isValidVideoUrl,
  getYouTubeThumbnail,
  isDirectVideoFile,
  toEmbeddableVideoUrl,
  fetchTutorialViewCounts,
  TUTORIAL_CATEGORIES,
  TUTORIAL_TARGET_ROLES,
  type Tutorial,
} from '@/lib/tutorials';

const TARGET_PAGES = [
  { value: 'none', label: 'None (Global)' },
  { value: '/dashboard/shops', label: 'Shops' },
  { value: '/dashboard/products', label: 'Products' },
  { value: '/dashboard/orders', label: 'Orders' },
  { value: '/dashboard/seller-orders', label: 'Seller Orders' },
  { value: '/dashboard/wholesaler-orders', label: 'Wholesaler Orders' },
  { value: '/dashboard/payment', label: 'Payment' },
  { value: '/dashboard/shipping', label: 'Shipping' },
  { value: '/dashboard/analytics', label: 'Analytics' },
  { value: '/dashboard/coupons', label: 'Coupons' },
  { value: '/dashboard/browse-shops', label: 'Browse Shops' },
];

const TutorialManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);

  const { data: tutorials = [], isLoading } = useQuery({
    queryKey: ['admin-tutorials'],
    queryFn: fetchAllTutorials,
  });

  const { data: viewCounts = {} } = useQuery({
    queryKey: ['tutorial-view-counts'],
    queryFn: fetchTutorialViewCounts,
  });

  const createMutation = useMutation({
    mutationFn: createTutorial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials'] });
      toast({ title: 'Tutorial Created', description: 'Tutorial has been added successfully.' });
      setDialogOpen(false);
      setEditingTutorial(null);
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Tutorial> }) => updateTutorial(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials'] });
      toast({ title: 'Tutorial Updated' });
      setDialogOpen(false);
      setEditingTutorial(null);
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTutorial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tutorials'] });
      toast({ title: 'Tutorial Deleted' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const filtered = tutorials.filter((t: any) => {
    const q = search.toLowerCase();
    const matchesSearch = t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || t.target_role === roleFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesRole && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-poppins">Tutorial Manager</h2>
          <p className="text-muted-foreground font-poppins text-sm">Manage platform tutorials and guides</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingTutorial(null); }}>
          <DialogTrigger asChild>
            <Button className="font-poppins">
              <Plus className="h-4 w-4 mr-2" /> Add Tutorial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-poppins">{editingTutorial ? 'Edit Tutorial' : 'Add New Tutorial'}</DialogTitle>
            </DialogHeader>
            <TutorialForm
              tutorial={editingTutorial}
              userId={user?.id || ''}
              onSubmit={(data) => {
                if (editingTutorial) {
                  updateMutation.mutate({ id: editingTutorial.id, updates: data });
                } else {
                  createMutation.mutate(data as any);
                }
              }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tutorials..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 font-poppins" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40 font-poppins">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {TUTORIAL_TARGET_ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40 font-poppins">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {TUTORIAL_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tutorial List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-poppins">No tutorials found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((tutorial: any) => (
            <Card key={tutorial.id} className={`overflow-hidden ${!tutorial.is_active ? 'opacity-60' : ''}`}>
              <div className="flex">
                <div className="w-32 h-24 flex-shrink-0 bg-muted overflow-hidden">
                  <img
                    src={tutorial.thumbnail_url || getYouTubeThumbnail(tutorial.youtube_url) || '/placeholder.svg'}
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardContent className="flex-1 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-foreground font-poppins truncate">{tutorial.title}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-[10px]">{tutorial.category}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{tutorial.target_role}</Badge>
                        {tutorial.is_featured && <Badge className="text-[10px] bg-amber-500"><Star className="h-2.5 w-2.5 mr-0.5" />Featured</Badge>}
                        {!tutorial.is_active && <Badge variant="destructive" className="text-[10px]">Inactive</Badge>}
                        <Badge variant="outline" className="text-[10px] gap-0.5">
                          <Eye className="h-2.5 w-2.5" /> {viewCounts[tutorial.id] || 0}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => { setEditingTutorial(tutorial); setDialogOpen(true); }}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => {
                          if (confirm('Delete this tutorial?')) deleteMutation.mutate(tutorial.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Form component
interface TutorialFormProps {
  tutorial: Tutorial | null;
  userId: string;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const TutorialForm: React.FC<TutorialFormProps> = ({ tutorial, userId, onSubmit, isLoading }) => {
  const [title, setTitle] = useState(tutorial?.title || '');
  const [description, setDescription] = useState(tutorial?.description || '');
  const [videoUrl, setVideoUrl] = useState(tutorial?.youtube_url || '');
  const [category, setCategory] = useState(tutorial?.category || 'General');
  const [targetRole, setTargetRole] = useState(tutorial?.target_role || 'all');
  const [targetPage, setTargetPage] = useState(tutorial?.target_page || 'none');
  const [isFeatured, setIsFeatured] = useState(tutorial?.is_featured || false);
  const [isImportant, setIsImportant] = useState(tutorial?.is_important || false);
  const [isActive, setIsActive] = useState(tutorial?.is_active ?? true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const urlValid = videoUrl ? isValidVideoUrl(videoUrl) : true;
  const previewUrl = videoUrl ? toEmbeddableVideoUrl(videoUrl) : null;
  const directVideo = videoUrl ? isDirectVideoFile(videoUrl) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim() || !isValidVideoUrl(videoUrl)) return;

    let thumbnailUrl = tutorial?.thumbnail_url || null;
    if (thumbnailFile) {
      setUploading(true);
      try {
        thumbnailUrl = await uploadTutorialThumbnail(thumbnailFile);
      } catch {
        thumbnailUrl = null;
      }
      setUploading(false);
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      youtube_url: videoUrl.trim(),
      thumbnail_url: thumbnailUrl,
      category,
      target_role: targetRole,
      target_page: targetPage === 'none' ? null : targetPage.trim() || null,
      is_featured: isFeatured,
      is_important: isImportant,
      is_active: isActive,
      created_by: userId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="font-poppins">Title *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How to create a shop" className="font-poppins" required />
      </div>
      <div>
        <Label className="font-poppins">Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of this tutorial" className="font-poppins" rows={3} />
      </div>
      <div>
        <Label className="font-poppins">Video URL *</Label>
        <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." className="font-poppins" required />
        {videoUrl && !urlValid && (
          <p className="text-destructive text-xs mt-1 flex items-center gap-1 font-poppins">
            <AlertCircle className="h-3 w-3" /> Invalid video URL
          </p>
        )}
        {previewUrl && urlValid && (
          <div className="mt-2 space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-poppins text-xs"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Play className="h-3 w-3 mr-1" /> {showPreview ? 'Hide Preview' : 'Preview Video'}
            </Button>
            {showPreview && (
              <div className="aspect-video rounded border overflow-hidden bg-black">
                {directVideo ? (
                  <video src={previewUrl} controls className="w-full h-full" preload="metadata" />
                ) : (
                  <iframe
                    src={previewUrl}
                    title="Video preview"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        <Label className="font-poppins">Thumbnail (optional, auto-detected for YouTube if empty)</Label>
        <Input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} className="font-poppins" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="font-poppins">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="font-poppins"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TUTORIAL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="font-poppins">Target Role</Label>
          <Select value={targetRole} onValueChange={setTargetRole}>
            <SelectTrigger className="font-poppins"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TUTORIAL_TARGET_ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="font-poppins">Target Page</Label>
        <Select value={targetPage} onValueChange={setTargetPage}>
          <SelectTrigger className="font-poppins"><SelectValue placeholder="Select target page" /></SelectTrigger>
          <SelectContent>
            {TARGET_PAGES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          <Label className="font-poppins text-sm">Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isImportant} onCheckedChange={setIsImportant} />
          <Label className="font-poppins text-sm">Important</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label className="font-poppins text-sm">Active</Label>
        </div>
      </div>
      <Button type="submit" className="w-full font-poppins" disabled={isLoading || uploading || !title || !videoUrl || !urlValid}>
        {isLoading || uploading ? 'Saving...' : tutorial ? 'Update Tutorial' : 'Create Tutorial'}
      </Button>
    </form>
  );
};

export default TutorialManager;
