
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getWholesalerCommissionAnalytics } from '@/lib/commission-management-enhanced';
import { getCurrentUser } from '@/lib/auth';

export const EnhancedCommissionTracker: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['commission-analytics'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      return getWholesalerCommissionAnalytics(user.id);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commission Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No commission data available.</p>
        </CardContent>
      </Card>
    );
  }

  const suspensionRisk = analytics.pending_amount > 10000;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Commission Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Total Sales</span>
              </div>
              <p className="text-2xl font-bold">
                Rs. {analytics.total_sales.toLocaleString()}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                Rs. {analytics.pending_amount.toLocaleString()}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Paid</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                Rs. {analytics.paid_amount.toLocaleString()}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-600">Total Orders</span>
              </div>
              <p className="text-2xl font-bold">
                {analytics.total_commissions}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {suspensionRisk && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div>
                <p className="font-medium text-red-800">Account Suspension Risk</p>
                <p className="text-sm text-red-600">
                  Your pending commission exceeds Rs. 10,000. Please settle outstanding amounts to avoid account suspension.
                </p>
              </div>
              <Badge variant="destructive">High Risk</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
