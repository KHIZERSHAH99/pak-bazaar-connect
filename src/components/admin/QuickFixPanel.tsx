
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Zap, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { approveAllPendingProducts, approveAllPendingAds, getSystemStats } from '@/lib/admin-functions';

const QuickFixPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  const loadStats = async () => {
    try {
      const systemStats = await getSystemStats();
      setStats(systemStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  const handleApproveAllProducts = async () => {
    setIsLoading(true);
    try {
      const approved = await approveAllPendingProducts();
      toast({
        title: "Success",
        description: `Approved ${approved?.length || 0} products`,
      });
      await loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAllAds = async () => {
    setIsLoading(true);
    try {
      const approved = await approveAllPendingAds();
      toast({
        title: "Success",
        description: `Approved ${approved?.length || 0} ads`,
      });
      await loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve ads",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Fix Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Products</span>
                <Badge variant="secondary">
                  {stats?.productStatuses?.pending || 0}
                </Badge>
              </div>
              <Button 
                onClick={handleApproveAllProducts}
                disabled={isLoading || !stats?.productStatuses?.pending}
                className="w-full"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve All Products
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Ads</span>
                <Badge variant="secondary">
                  {stats?.productStatuses?.pending || 0}
                </Badge>
              </div>
              <Button 
                onClick={handleApproveAllAds}
                disabled={isLoading}
                className="w-full"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve All Ads
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={loadStats}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Statistics
            </Button>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.users}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.shops}</div>
                <div className="text-sm text-gray-600">Shops</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.products}</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.orders}</div>
                <div className="text-sm text-gray-600">Orders</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickFixPanel;
