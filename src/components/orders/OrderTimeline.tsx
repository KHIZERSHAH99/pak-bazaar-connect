import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Clock, Package, Truck, XCircle, RotateCcw } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface OrderTimelineProps {
  orderId: string;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-500', label: 'Order Placed' },
  confirmed: { icon: CheckCircle, color: 'text-blue-500', label: 'Confirmed' },
  processing: { icon: Package, color: 'text-indigo-500', label: 'Processing' },
  packed: { icon: Package, color: 'text-violet-500', label: 'Packed' },
  shipped: { icon: Truck, color: 'text-cyan-500', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-emerald-500', label: 'Delivered' },
  completed: { icon: CheckCircle, color: 'text-emerald-600', label: 'Completed' },
  rejected: { icon: XCircle, color: 'text-red-500', label: 'Rejected' },
  returned: { icon: RotateCcw, color: 'text-orange-500', label: 'Returned' },
};

const OrderTimeline: React.FC<OrderTimelineProps> = ({ orderId }) => {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['order-timeline', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground font-poppins text-center py-4">
        No status history available yet.
      </p>
    );
  }

  return (
    <div className="relative">
      {history.map((entry: any, index: number) => {
        const config = statusConfig[entry.status] || statusConfig.pending;
        const Icon = config.icon;
        const isLast = index === history.length - 1;

        return (
          <div key={entry.id} className="flex gap-3 relative">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-4 top-8 w-0.5 h-[calc(100%-8px)] bg-border" />
            )}
            {/* Icon */}
            <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 ${isLast ? 'border-primary' : 'border-border'}`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            {/* Content */}
            <div className="pb-6 flex-1">
              <p className={`text-sm font-medium font-poppins ${isLast ? 'text-foreground' : 'text-muted-foreground'}`}>
                {config.label}
              </p>
              <p className="text-xs text-muted-foreground font-poppins">
                {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
                {' · '}
                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
              </p>
              {entry.notes && (
                <p className="text-xs text-muted-foreground mt-1 font-poppins italic">
                  {entry.notes}
                </p>
              )}
              {entry.tracking_number && (
                <p className="text-xs text-primary mt-1 font-poppins">
                  Tracking: {entry.tracking_number}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
