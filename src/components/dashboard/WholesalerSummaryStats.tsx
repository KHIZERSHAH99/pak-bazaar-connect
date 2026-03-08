import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, DollarSign, Store, Package, MessageSquare, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const WholesalerSummaryStats: React.FC = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['wholesaler-summary-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Fetch shops owned by this wholesaler
      const { data: shops } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id);

      const shopIds = shops?.map(s => s.id) || [];

      // Parallel queries
      const [ordersResult, productsResult, messagesResult] = await Promise.all([
        shopIds.length > 0
          ? supabase
              .from('orders')
              .select('id, total_amount, status, created_at')
              .in('shop_id', shopIds)
          : Promise.resolve({ data: [] }),
        shopIds.length > 0
          ? supabase
              .from('products')
              .select('id, is_active')
              .in('shop_id', shopIds)
          : Promise.resolve({ data: [] }),
        supabase
          .from('messages')
          .select('id, read_at, conversation_id')
          .is('read_at', null)
          .neq('sender_id', user.id),
      ]);

      const orders = ordersResult.data || [];
      const products = productsResult.data || [];
      
      // Filter unread messages to only those in user's conversations
      const { data: convs } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
      const convIds = new Set(convs?.map(c => c.id) || []);
      const unreadMessages = (messagesResult.data || []).filter(m => convIds.has(m.conversation_id));

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const todayOrders = orders.filter(o => o.created_at?.startsWith(todayStr));
      const pendingOrders = orders.filter(o => o.status === 'pending');
      const completedOrders = orders.filter(o => ['confirmed', 'shipped', 'delivered'].includes(o.status));
      const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

      // Calculate this week vs last week revenue for trend
      const weekAgo = new Date(today.getTime() - 7 * 86400000).toISOString();
      const twoWeeksAgo = new Date(today.getTime() - 14 * 86400000).toISOString();
      const thisWeekRevenue = completedOrders
        .filter(o => o.created_at && o.created_at >= weekAgo)
        .reduce((sum, o) => sum + Number(o.total_amount), 0);
      const lastWeekRevenue = completedOrders
        .filter(o => o.created_at && o.created_at >= twoWeeksAgo && o.created_at < weekAgo)
        .reduce((sum, o) => sum + Number(o.total_amount), 0);
      const revenueTrend = lastWeekRevenue > 0 
        ? Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100) 
        : thisWeekRevenue > 0 ? 100 : 0;

      return {
        totalShops: shopIds.length,
        totalProducts: products.length,
        activeProducts: products.filter(p => p.is_active).length,
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        pendingOrders: pendingOrders.length,
        totalRevenue,
        unreadMessages: unreadMessages.length,
        revenueTrend,
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  if (!stats) return null;

  const cards = [
    { label: "Today's Orders", value: stats.todayOrders, icon: ShoppingCart, color: 'text-blue-600' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: TrendingUp, color: 'text-orange-600' },
    { label: 'Total Revenue', value: `PKR ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', trend: stats.revenueTrend },
    { label: 'Shops', value: stats.totalShops, icon: Store, color: 'text-purple-600' },
    { label: 'Active Products', value: `${stats.activeProducts}/${stats.totalProducts}`, icon: Package, color: 'text-primary' },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: MessageSquare, color: 'text-rose-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className="border border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <span className="text-xs text-muted-foreground font-poppins">{card.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-foreground font-poppins">{card.value}</p>
              {card.trend !== undefined && card.trend !== 0 && (
                <span className={`flex items-center text-xs font-medium ${card.trend > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                  {card.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(card.trend)}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WholesalerSummaryStats;
