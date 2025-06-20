
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  BarChart3, 
  Clock, 
  DollarSign, 
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';
import { Ad } from '@/lib/ads';

interface EnhancedAdCardProps {
  ad: Ad & { products?: { name: string; price: number; image?: string } };
  onPause: (adId: string) => void;
  onResume: (adId: string) => void;
  onViewAnalytics: (adId: string) => void;
}

const EnhancedAdCard: React.FC<EnhancedAdCardProps> = ({ 
  ad, 
  onPause, 
  onResume, 
  onViewAnalytics 
}) => {
  const getStatusBadge = (status: string, isAutoStopped: boolean) => {
    if (isAutoStopped) {
      return <Badge className="bg-orange-100 text-orange-800">Auto Stopped</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge className="bg-gray-100 text-gray-800">Paused</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
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

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const getCostPerOrder = () => {
    if (ad.total_orders === 0) return 0;
    return ad.current_spend / ad.total_orders;
  };

  const remainingDays = getRemainingDays();
  const budgetProgress = getBudgetProgress();
  const costPerOrder = getCostPerOrder();

  return (
    <Card className="overflow-hidden">
      {/* Ad Image */}
      <div className="h-48 bg-gray-100 relative">
        {ad.image ? (
          <img 
            src={ad.image} 
            alt={ad.headline} 
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/300x200?text=Advertisement";
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BarChart3 className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {ad.is_auto_stopped && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
            Auto Stopped
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {ad.headline}
          </CardTitle>
          {getStatusBadge(ad.status, ad.is_auto_stopped)}
        </div>
        
        {/* Product Info */}
        {ad.products && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {ad.products.image && (
              <img 
                src={ad.products.image} 
                alt={ad.products.name}
                className="w-6 h-6 object-cover rounded"
              />
            )}
            <span>{ad.products.name} - {formatCurrency(ad.products.price)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Budget Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Budget Used</span>
            <span className="text-sm text-gray-600">
              {formatCurrency(ad.current_spend)} / {formatCurrency(ad.budget_cap)}
            </span>
          </div>
          <Progress value={budgetProgress} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Orders</span>
            </div>
            <div className="text-lg font-bold text-blue-600">{ad.total_orders}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">CPO</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {costPerOrder > 0 ? formatCurrency(costPerOrder) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Time Remaining */}
        {remainingDays !== null && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {remainingDays === 0 ? 'Campaign ended' : `${remainingDays} days remaining`}
            </span>
          </div>
        )}

        {/* Auto Stop Warning */}
        {(budgetProgress > 80 || (remainingDays !== null && remainingDays <= 2)) && !ad.is_auto_stopped && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              {budgetProgress > 80 ? 'Budget nearly exhausted' : 'Campaign ending soon'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {ad.status === 'active' && !ad.is_auto_stopped && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPause(ad.id)}
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
          
          {(ad.status === 'paused' || ad.is_auto_stopped) && !ad.is_auto_stopped && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onResume(ad.id)}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-1" />
              Resume
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewAnalytics(ad.id)}
            className="flex-1"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
          </Button>
        </div>

        {/* Creation Date */}
        <div className="text-xs text-gray-500 text-center">
          Created: {new Date(ad.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAdCard;
