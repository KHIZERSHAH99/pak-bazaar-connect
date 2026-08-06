import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { History, Search } from 'lucide-react';
import { format } from 'date-fns';

const PAGE_SIZE = 20;

const AdminOrderActivityLog: React.FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order-activity', page],
    queryFn: async () => {
      const from = page * PAGE_SIZE;
      const { data: rows, error } = await supabase
        .from('order_status_history')
        .select('id, order_id, status, previous_status, notes, created_at, changed_by')
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;

      const actorIds = Array.from(
        new Set((rows || []).map((r: any) => r.changed_by).filter(Boolean))
      );
      let actors: Record<string, string> = {};
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, business_name, contact_name, email')
          .in('id', actorIds);
        actors = Object.fromEntries(
          (profiles || []).map((p: any) => [p.id, p.business_name || p.contact_name || p.email])
        );
      }
      return { rows: rows || [], actors };
    },
  });

  const rows = (data?.rows || []).filter((r: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return r.order_id?.toLowerCase().includes(q) || r.status?.toLowerCase().includes(q);
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Order activity log
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search order id or status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading activity...</p>
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No activity recorded</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r: any) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    Order #{String(r.order_id).slice(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {data?.actors[r.changed_by] || 'System'} ·{' '}
                    {format(new Date(r.created_at), 'dd MMM yyyy, HH:mm')}
                  </p>
                  {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {r.previous_status && (
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {r.previous_status}
                    </Badge>
                  )}
                  <span className="text-muted-foreground">→</span>
                  <Badge className="text-[10px] capitalize">{r.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">Page {page + 1}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={(data?.rows.length || 0) < PAGE_SIZE}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminOrderActivityLog;
