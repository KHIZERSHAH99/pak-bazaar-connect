
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';
import { Ad } from '@/lib/ads';

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
  if (!ad) return null;

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const costPerOrder = ad.total_orders && ad.total_orders > 0 
    ? (ad.current_spend || 0) / ad.total_orders 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ad Analytics - {ad.headline}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(ad.current_spend || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {ad.total_orders || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Cost Per Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {costPerOrder > 0 ? formatCurrency(costPerOrder) : 'N/A'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Budget Left</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency((ad.budget_cap || 0) - (ad.current_spend || 0))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Status */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    ad.status === 'active' ? 'bg-green-100 text-green-800' :
                    ad.status === 'paused' ? 'bg-gray-100 text-gray-800' :
                    ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                  </span>
                </div>
                
                {ad.campaign_start_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Started:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(ad.campaign_start_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {ad.campaign_end_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ends:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(ad.campaign_end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {ad.is_auto_stopped && (
                  <div className="bg-orange-50 border border-orange-200 rounded p-3">
                    <p className="text-sm text-orange-800">
                      ⚠️ Campaign was automatically stopped due to budget or time limits.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Analytics Coming Soon</p>
                <p>Detailed performance metrics including impressions, clicks, and conversion rates will be available once your campaign goes live.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdAnalyticsDashboard;
