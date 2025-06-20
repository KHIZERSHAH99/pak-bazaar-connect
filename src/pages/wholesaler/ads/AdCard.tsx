
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, FileText, BarChart3 } from 'lucide-react';
import { Ad } from '@/lib/ads';

interface AdCardProps {
  ad: Ad;
  onEdit: () => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onEdit }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'paused':
        return <Badge className="bg-gray-100 text-gray-800">Paused</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-gray-100">
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
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{ad.headline}</h3>
          {getStatusBadge(ad.status)}
        </div>
        
        {/* Campaign Metrics */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Spend:</span>
            <span className="font-medium">{formatCurrency(ad.current_spend || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Orders:</span>
            <span className="font-medium">{ad.total_orders || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Budget:</span>
            <span className="font-medium">{formatCurrency(ad.budget_cap || 0)}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Created: {new Date(ad.created_at || '').toLocaleDateString()}
        </p>

        <div className="flex gap-2">
          {ad.status !== 'active' && ad.status !== 'pending' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onEdit}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => console.log('View analytics for', ad.id)}
            className="flex-1"
          >
            <BarChart3 className="h-4 w-4 mr-2" /> Analytics
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AdCard;
