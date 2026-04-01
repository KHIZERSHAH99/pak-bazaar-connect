import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, Clock } from 'lucide-react';

const reasonLabels: Record<string, string> = {
  order_confirmed: 'Order Confirmed',
  order_rejected: 'Order Rejected',
  order_cancelled: 'Order Cancelled',
  order_returned: 'Order Returned',
  manual_restock: 'Manual Restock',
};

const StockMovementLog: React.FC = () => {
  const { user } = useAuth();

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['stock-movements', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*, products:product_id(name, image)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Stock Movement History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-6 text-muted-foreground">Loading movements...</p>
        ) : movements.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No stock movements recorded yet</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {movements.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className={`shrink-0 rounded-full p-1.5 ${m.quantity_change > 0 ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                  {m.quantity_change > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {m.products?.image && <img src={m.products.image} alt="" className="w-6 h-6 rounded object-cover" />}
                    <span className="font-medium text-sm truncate">{m.products?.name || 'Unknown'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {m.previous_quantity} → {m.new_quantity} units
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="outline" className="text-[10px] mb-1">
                    {reasonLabels[m.reason] || m.reason}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground">{formatDate(m.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockMovementLog;
