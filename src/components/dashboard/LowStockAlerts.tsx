import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface LowStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
  moq: number;
  shop_id: string;
  shop_name: string;
}

interface LowStockAlertsProps {
  lowStockThreshold?: number;
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ lowStockThreshold = 10 }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: lowStockProducts, isLoading } = useQuery({
    queryKey: ['low-stock-products', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user's shops
      const { data: shops, error: shopsError } = await supabase
        .from('shops')
        .select('id, name')
        .eq('owner_id', user.id);

      if (shopsError) throw shopsError;
      if (!shops || shops.length === 0) return [];

      const shopIds = shops.map(s => s.id);

      // Get low stock products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, stock_quantity, moq, shop_id')
        .in('shop_id', shopIds)
        .eq('is_active', true)
        .not('stock_quantity', 'is', null)
        .lte('stock_quantity', lowStockThreshold)
        .order('stock_quantity', { ascending: true });

      if (productsError) throw productsError;

      // Merge shop names
      return (products || []).map(p => ({
        ...p,
        shop_name: shops.find(s => s.id === p.shop_id)?.name || 'Unknown Shop'
      })) as LowStockProduct[];
    },
    enabled: !!user,
    staleTime: 60 * 1000 // 1 minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const outOfStock = lowStockProducts?.filter(p => p.stock_quantity === 0) || [];
  const lowStock = lowStockProducts?.filter(p => p.stock_quantity > 0) || [];

  if (!lowStockProducts || lowStockProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5 text-emerald-600" />
            Stock Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Package className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
            <p className="text-sm text-muted-foreground">All products are well stocked!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader className="bg-amber-50 dark:bg-amber-950/30">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Low Stock Alerts
          </div>
          <Badge variant="destructive">{lowStockProducts.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {/* Out of Stock (Critical) */}
          {outOfStock.map(product => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.shop_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="whitespace-nowrap">
                  Out of Stock
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/dashboard/products?edit=${product.id}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Low Stock (Warning) */}
          {lowStock.map(product => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.shop_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="whitespace-nowrap border-amber-500 text-amber-700">
                  {product.stock_quantity} left
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/dashboard/products?edit=${product.id}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockAlerts;
