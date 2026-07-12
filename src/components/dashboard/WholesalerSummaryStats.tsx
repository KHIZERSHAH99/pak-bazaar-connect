import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import {
  ShoppingCart,
  DollarSign,
  Store,
  Package,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from 'lucide-react';

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
      const productsFull = products as Array<{ id: string; is_active: boolean; stock_quantity?: number | null }>;
      
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
        lowStockCount: productsFull.filter(p => (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= 5).length,
        outOfStockCount: productsFull.filter(p => (p.stock_quantity ?? 0) === 0).length,
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        pendingOrders: pendingOrders.length,
        totalRevenue,
        todayRevenue: todayOrders
          .filter(o => ['confirmed', 'shipped', 'delivered'].includes(o.status))
          .reduce((sum, o) => sum + Number(o.total_amount), 0),
        unreadMessages: unreadMessages.length,
        revenueTrend,
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  if (!stats) return null;

  // Phase 2 — 3 huge primary numbers, Urdu-first, no cognitive overload.
  const primary = [
    {
      ur: 'نئے آرڈرز',
      roman: 'Naye orders',
      value: stats.pendingOrders,
      icon: ShoppingCart,
      accent: 'text-yellow-300',
    },
    {
      ur: 'آج کی بکری',
      roman: 'Aaj ki bikri',
      value: `Rs ${stats.todayRevenue.toLocaleString('en-PK')}`,
      icon: DollarSign,
      accent: 'text-primary',
    },
    {
      ur: 'اسٹاک کم ہو رہا ہے',
      roman: 'Stock kam ho raha hai',
      value: stats.lowStockCount + stats.outOfStockCount,
      icon: AlertTriangle,
      accent: 'text-destructive',
    },
  ];

  const secondary = [
    { label: 'Total revenue', value: `Rs ${stats.totalRevenue.toLocaleString('en-PK')}`, icon: DollarSign, trend: stats.revenueTrend },
    { label: 'Shops', value: stats.totalShops, icon: Store },
    { label: 'Active products', value: `${stats.activeProducts}/${stats.totalProducts}`, icon: Package },
    { label: 'Unread messages', value: stats.unreadMessages, icon: MessageSquare },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {primary.map((card) => (
          <Card key={card.roman} className="border border-border">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-poppins uppercase tracking-wide">
                  {card.roman}
                </span>
                <card.icon className={`w-5 h-5 ${card.accent}`} />
              </div>
              <div className="text-3xl sm:text-4xl font-bold font-poppins mb-1">
                {card.value}
              </div>
              <div className="text-base sm:text-lg text-muted-foreground font-poppins" dir="rtl">
                {card.ur}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <details className="group">
        <summary className="cursor-pointer text-xs text-muted-foreground font-poppins hover:text-foreground list-none flex items-center gap-2 py-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="group-open:hidden">Show more numbers</span>
          <span className="hidden group-open:inline">Hide extra numbers</span>
        </summary>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {secondary.map((card) => (
            <Card key={card.label} className="border border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <card.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground font-poppins">{card.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-foreground font-poppins">{card.value}</p>
                  {'trend' in card && card.trend !== undefined && card.trend !== 0 && (
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
      </details>
    </div>
  );
};

export default WholesalerSummaryStats;
