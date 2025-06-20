
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { Ad } from '@/lib/ads';
import AdHeader from './card/AdHeader';
import AdMetrics from './card/AdMetrics';
import AdActions from './card/AdActions';

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
  const getRemainingDays = () => {
    if (!ad.campaign_end_date) return null;
    const endDate = new Date(ad.campaign_end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const remainingDays = getRemainingDays();

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

      <AdHeader 
        headline={ad.headline}
        status={ad.status}
        isAutoStopped={ad.is_auto_stopped || false}
        productInfo={ad.products}
      />

      <CardContent className="space-y-4">
        <AdMetrics
          currentSpend={ad.current_spend || 0}
          budgetCap={ad.budget_cap || 0}
          totalOrders={ad.total_orders || 0}
          remainingDays={remainingDays}
          isAutoStopped={ad.is_auto_stopped || false}
        />

        <AdActions
          status={ad.status}
          isAutoStopped={ad.is_auto_stopped || false}
          adId={ad.id}
          onPause={onPause}
          onResume={onResume}
          onViewAnalytics={onViewAnalytics}
        />

        {/* Creation Date */}
        <div className="text-xs text-gray-500 text-center">
          Created: {new Date(ad.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAdCard;
