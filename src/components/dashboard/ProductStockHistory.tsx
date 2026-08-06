import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowDown, ArrowUp } from 'lucide-react';

const reasonLabels: Record<string, string> = {
  order_confirmed: 'Order confirmed',
  order_rejected: 'Order rejected',
  order_cancelled: 'Order cancelled',
  order_returned: 'Order returned',
  manual_restock: 'Manual restock',
};

interface ProductStockHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: { id: string; name: string } | null;
}

const ProductStockHistory: React.FC<ProductStockHistoryProps> = ({ open, onOpenChange, product }) => {
  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['stock-movements', 'product', product?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('id, quantity_change, previous_quantity, new_quantity, reason, created_at')
        .eq('product_id', product!.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!product?.id,
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg font-poppins">
        <DialogHeader>
          <DialogTitle className="text-base">Stock history</DialogTitle>
          <DialogDescription>{product?.name}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading history...</p>
        ) : movements.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No stock changes recorded yet</p>
        ) : (
          <ol className="relative max-h-[420px] space-y-3 overflow-y-auto border-l pl-4">
            {movements.map((m: any) => (
              <li key={m.id} className="relative">
                <span
                  className={`absolute -left-[22px] top-1 rounded-full p-1 ${
                    m.quantity_change > 0
                      ? 'bg-primary/10 text-primary'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {m.quantity_change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {m.quantity_change > 0 ? '+' : ''}{m.quantity_change} units
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {reasonLabels[m.reason] || m.reason}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {m.previous_quantity} → {m.new_quantity} · {formatDate(m.created_at)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductStockHistory;
