
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CommissionData {
  total_pending: number;
  total_paid: number;
  total_commission: number;
  recent_commissions: Array<{
    id: string;
    order_id: string;
    sale_amount: number;
    commission_amount: number;
    status: string;
    created_at: string;
  }>;
}

const RealTimeCommissionTracker: React.FC = () => {
  const { profile } = useAuth();
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetchCommissionData();
    
    // Set up real-time subscription for commission updates
    const channel = supabase
      .channel('commission-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commission_records'
        },
        (payload) => {
          console.log('Commission update:', payload);
          fetchCommissionData(); // Refresh data when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, timeframe]);

  const fetchCommissionData = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get commission records for the wholesaler
      const { data: commissions, error } = await supabase
        .from('commission_records')
        .select('*')
        .eq('wholesaler_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching commission data:', error);
        return;
      }

      // Calculate totals
      const totalPending = commissions?.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission_amount, 0) || 0;
      const totalPaid = commissions?.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commission_amount, 0) || 0;
      const totalCommission = totalPending + totalPaid;

      setCommissionData({
        total_pending: totalPending,
        total_paid: totalPaid,
        total_commission: totalCommission,
        recent_commissions: commissions?.slice(0, 10) || []
      });
    } catch (error) {
      console.error('Error in fetchCommissionData:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'paid' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Paid
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!commissionData) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600">No commission data available</p>
      </Card>
    );
  }

  const pieData = [
    { name: 'Paid', value: commissionData.total_paid, color: '#10b981' },
    { name: 'Pending', value: commissionData.total_pending, color: '#fbbf24' }
  ];

  return (
    <div className="space-y-6">
      {/* Commission Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Commission</p>
              <p className="text-2xl font-bold">PKR {commissionData.total_commission.toLocaleString()}</p>
              <p className="text-xs text-gray-500">All time earnings</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">PKR {commissionData.total_pending.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Awaiting payment</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">PKR {commissionData.total_paid.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Received payments</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Commission Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Commission Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: PKR ${value.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `PKR ${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Commissions */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Recent Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {commissionData.recent_commissions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No commission records found</p>
              ) : (
                commissionData.recent_commissions.map((commission) => (
                  <div key={commission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          Order #{commission.order_id.slice(0, 8)}
                        </p>
                        {getStatusBadge(commission.status)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <p>Sale: PKR {commission.sale_amount.toLocaleString()}</p>
                        <p>Commission: PKR {commission.commission_amount.toLocaleString()}</p>
                        <p>{new Date(commission.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Real-time commission tracking active</span>
      </div>
    </div>
  );
};

export default RealTimeCommissionTracker;
