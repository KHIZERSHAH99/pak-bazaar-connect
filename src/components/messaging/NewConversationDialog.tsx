import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Loader2, Store, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  email: string;
  business_name?: string;
  role: string;
  type: 'user';
}

interface ShopResult {
  id: string;
  name: string;
  owner_id: string;
  owner_email?: string;
  type: 'shop';
}

type Result = SearchResult | ShopResult;

interface NewConversationDialogProps {
  onConversationCreated: (conversationId: string) => void;
}

const NewConversationDialog: React.FC<NewConversationDialogProps> = ({ onConversationCreated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearch.trim().length >= 2) {
      performSearch(debouncedSearch.trim());
    } else {
      setResults([]);
    }
  }, [debouncedSearch]);

  const performSearch = async (query: string) => {
    if (!user) return;
    setLoading(true);
    try {
      // Search profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, business_name, role')
        .neq('id', user.id)
        .or(`email.ilike.%${query}%,business_name.ilike.%${query}%`)
        .limit(10);

      // Search shops
      const { data: shops } = await supabase
        .from('shops')
        .select('id, name, owner_id')
        .neq('owner_id', user.id)
        .ilike('name', `%${query}%`)
        .limit(10);

      const userResults: Result[] = (profiles || []).map(p => ({ ...p, type: 'user' as const }));

      // For shops, get owner emails
      const shopOwnerIds = [...new Set((shops || []).map(s => s.owner_id))];
      let ownerMap = new Map<string, string>();
      if (shopOwnerIds.length > 0) {
        const { data: owners } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', shopOwnerIds);
        ownerMap = new Map((owners || []).map(o => [o.id, o.email]));
      }

      const shopResults: Result[] = (shops || []).map(s => ({
        ...s,
        owner_email: ownerMap.get(s.owner_id),
        type: 'shop' as const,
      }));

      setResults([...shopResults, ...userResults]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (targetUserId: string) => {
    if (!user || creating) return;
    setCreating(true);
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(buyer_id.eq.${user.id},seller_id.eq.${targetUserId}),and(buyer_id.eq.${targetUserId},seller_id.eq.${user.id})`)
        .maybeSingle();

      if (existing) {
        onConversationCreated(existing.id);
        setOpen(false);
        setSearchTerm('');
        return;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          buyer_id: user.id,
          seller_id: targetUserId,
        })
        .select()
        .single();

      if (error) throw error;

      onConversationCreated(newConv.id);
      setOpen(false);
      setSearchTerm('');
      toast({ title: 'Conversation started!' });
    } catch (error: any) {
      toast({ title: 'Failed to start conversation', description: error.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = (result: Result) => {
    if (result.type === 'shop') {
      startConversation(result.owner_id);
    } else {
      startConversation(result.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-poppins">Start a Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search shops or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : results.length === 0 && debouncedSearch.trim().length >= 2 ? (
              <p className="text-center text-sm text-muted-foreground py-8 font-poppins">
                No results found
              </p>
            ) : results.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8 font-poppins">
                Type at least 2 characters to search
              </p>
            ) : (
              results.map((result, i) => (
                <button
                  key={`${result.type}-${result.type === 'shop' ? result.id : result.id}-${i}`}
                  onClick={() => handleSelect(result)}
                  disabled={creating}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs">
                      {result.type === 'shop'
                        ? result.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                        : (result.business_name || result.email)?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm font-poppins truncate">
                        {result.type === 'shop' ? result.name : (result.business_name || result.email)}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0 gap-1">
                        {result.type === 'shop' ? (
                          <><Store className="h-3 w-3" /> Shop</>
                        ) : (
                          <><User className="h-3 w-3" /> {result.role}</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.type === 'shop' ? result.owner_email : result.email}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationDialog;
