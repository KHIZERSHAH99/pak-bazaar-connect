
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import { getAdAnalytics, Ad } from '@/lib/ads';

interface AdAnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  ad: Ad | null;
}

const AdAnalyticsDashboard: React.FC<AdAnalyticsDashboardProps> = ({
  isOpen,
  onClose,
  ad
}) => {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && ad) {
      fetchAnalytics();
    }
  }, [isOpen, ad]);

  const fetchAnalytics = async () => {
    if (!ad) return;
    
    try {
      setLoading(true);
      const data = await getAdAnalytics(ad.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!ad) return null;

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const getBudgetProgress = () => {
    if (ad.budget_cap <= 0) return 0;
    return (ad.current_spend / ad.budget_cap) * 100;
  };

  const getRemainingDays = () => {
    if (!ad.campaign_end_date) return null;
    const endDate = new Date(ad.campaign_end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getCostPerOrder = () => {
    if (ad.total_orders === 0) return 0;
    return ad.current_spend / ad.total_orders;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const budgetProgress = getBudgetProgress();
  const remainingDays = getRemainingDays();
  const costPerOrder = getCostPerOrder();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ad Campaign Analytics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ad Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{ad.headline}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Campaign ID: {ad.id.slice(0, 8)}...
                  </p>
                </div>
                <Badge className={getStatusColor(ad.status)}>
                  {ad.is_auto_stopped ? 'Auto Stopped' : ad.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ad.image && (
                  <div>
                    <img 
                      src={ad.image} 
                      alt={ad.headline}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <p><strong>Campaign Type:</strong> Cost Per Order (CPO)</p>
                  <p><strong>Created:</strong> {new Date(ad.created_at).toLocaleDateString()}</p>
                  {ad.campaign_start_date && (
                    <p><strong>Started:</strong> {new Date(ad.campaign_start_date).toLocaleDateString()}</p>
                  )}
                  {remainingDays !== null && (
                    <p><strong>Days Remaining:</strong> {remainingDays}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Current Spend</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(ad.current_spend)}
                </div>
                <div className="text-xs text-gray-500">
                  of {formatCurrency(ad.budget_cap)} budget
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Total Orders</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {ad.total_orders}
                </div>
                <div className="text-xs text-gray-500">
                  orders generated
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Cost Per Order</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {costPerOrder > 0 ? formatCurrency(costPerOrder) : 'N/A'}
                </div>
                <div className="text-xs text-gray-500">
                  average CPO
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Days Active</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {ad.campaign_start_date ? 
                    Math.floor((new Date().getTime() - new Date(ad.campaign_start_date).getTime()) / (1000 * 60 * 60 * 24))
                    : 0
                  }
                </div>
                <div className="text-xs text-gray-500">
                  days running
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budget Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Total Budget Progress</span>
                    <span className="text-sm text-gray-600">
                      {budgetProgress.toFixed(1)}% used
                    </span>
                  </div>
                  <Progress value={budgetProgress} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>{formatCurrency(ad.current_spend)} spent</span>
                    <span>{formatCurrency(ad.budget_cap - ad.current_spend)} remaining</span>
                  </div>
                </div>

                {ad.daily_budget_limit && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Daily Budget Limit</span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(ad.daily_budget_limit)} per day
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budgetProgress > 80 && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-800">
                      Your budget is {budgetProgress.toFixed(0)}% used. Consider increasing budget if performance is good.
                    </span>
                  </div>
                )}
                
                {ad.total_orders === 0 && ad.current_spend === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Your ad is ready to start generating orders once approved by admin.
                    </span>
                  </div>
                )}
                
                {costPerOrder > 0 && costPerOrder < 100 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Great performance! Your cost per order is very efficient.
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdAnalyticsDashboard;
