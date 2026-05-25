import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, AlertTriangle, XCircle, CheckCircle, Search, RefreshCw } from 'lucide-react';
import RestockDialog from './RestockDialog';
import StockMovementLog from './StockMovementLog';

const LOW_STOCK_THRESHOLD = 10;

const InventoryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [shopFilter, setShopFilter] = useState<string>('all');
  const [restockProduct, setRestockProduct] = useState<{ id: string; name: string; stock_quantity: number | null } | null>(null);

  const { data: shops = [] } = useQuery({
    queryKey: ['inventory-shops', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('shops').select('id, name').eq('owner_id', user!.id);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['inventory-products', user?.id],
    queryFn: async () => {
      const shopIds = shops.map(s => s.id);
      if (!shopIds.length) return [];
      const { data } = await supabase
        .from('products')
        .select('id, name, stock_quantity, is_active, shop_id, image, price')
        .in('shop_id', shopIds)
        .order('stock_quantity', { ascending: true, nullsFirst: true });
      return data || [];
    },
    enabled: shops.length > 0,
  });

  const shopMap = useMemo(() => Object.fromEntries(shops.map(s => [s.id, s.name])), [shops]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (shopFilter !== 'all' && p.shop_id !== shopFilter) return false;
      const qty = p.stock_quantity ?? 0;
      if (stockFilter === 'out' && qty > 0) return false;
      if (stockFilter === 'low' && (qty === 0 || qty > LOW_STOCK_THRESHOLD)) return false;
      if (stockFilter === 'healthy' && qty <= LOW_STOCK_THRESHOLD) return false;
      return true;
    });
  }, [products, search, stockFilter, shopFilter]);

  const stats = useMemo(() => {
    const total = products.length;
    const totalUnits = products.reduce((s, p) => s + (p.stock_quantity ?? 0), 0);
    const outOfStock = products.filter(p => (p.stock_quantity ?? 0) === 0).length;
    const lowStock = products.filter(p => {
      const q = p.stock_quantity ?? 0;
      return q > 0 && q <= LOW_STOCK_THRESHOLD;
    }).length;
    return { total, totalUnits, outOfStock, lowStock };
  }, [products]);

  const getStockBadge = (qty: number | null) => {
    const q = qty ?? 0;
    if (q === 0) return <Badge variant="destructive" className="text-[10px]"><XCircle className="w-3 h-3 mr-1" />Out of Stock</Badge>;
    if (q <= LOW_STOCK_THRESHOLD) return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30 text-[10px]"><AlertTriangle className="w-3 h-3 mr-1" />Low Stock</Badge>;
    return <Badge className="bg-green-500/20 text-green-700 border-green-500/30 text-[10px]"><CheckCircle className="w-3 h-3 mr-1" />Healthy</Badge>;
  };

  const statCards = [
    { label: 'Total Products', value: stats.total, icon: Package, color: 'text-primary' },
    { label: 'Total Units', value: stats.totalUnits.toLocaleString(), icon: Package, color: 'text-blue-600' },
    { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'text-yellow-600' },
    { label: 'Out of Stock', value: stats.outOfStock, icon: XCircle, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <s.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${s.color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold leading-tight">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Product Inventory</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            {shops.length > 1 && (
              <Select value={shopFilter} onValueChange={setShopFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Shops" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shops</SelectItem>
                  {shops.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading inventory...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No products found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Product</th>
                    <th className="pb-2 pr-4">Shop</th>
                    <th className="pb-2 pr-4 text-right">Stock</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded object-cover" />}
                          <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{shopMap[p.shop_id] || '—'}</td>
                      <td className="py-3 pr-4 text-right font-mono">{p.stock_quantity ?? 0}</td>
                      <td className="py-3 pr-4">{getStockBadge(p.stock_quantity)}</td>
                      <td className="py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRestockProduct({ id: p.id, name: p.name, stock_quantity: p.stock_quantity })}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Restock
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <StockMovementLog />

      <RestockDialog
        open={!!restockProduct}
        onOpenChange={(open) => !open && setRestockProduct(null)}
        product={restockProduct}
      />
    </div>
  );
};

export default InventoryDashboard;
