
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Commission, getOrdersForWholesaler, getSellerCommissions } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CommissionSummary from '@/components/CommissionSummary';
import { LineChart, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const SellerDashboard: React.FC = () => {
  const { toast } = useToast();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const commissionsData = await getSellerCommissions();
        setCommissions(commissionsData as Commission[]);
        
        const ordersData = await getOrdersForWholesaler();
        setOrders(ordersData);
        
        const salesByDate = ordersData.reduce((acc: any, order: any) => {
          const date = new Date(order.created_at).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += order.total_amount;
          return acc;
        }, {});
        
        const chartData = Object.keys(salesByDate).map(date => ({
          date,
          amount: salesByDate[date]
        }));
        
        chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setSalesData(chartData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Seller Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor your sales performance and platform fees</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-pulse text-pakistani_green-600 dark:text-pakistani_green-400">Loading dashboard...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-2 rounded-full bg-pakistani_green-100 dark:bg-pakistani_green-900/50 p-2">
                      <BarChart3 className="h-4 w-4 text-pakistani_green-700 dark:text-pakistani_green-400" />
                    </div>
                    <div className="text-2xl font-bold">{orders.length}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Your sales performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {salesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLine
                        data={salesData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `PKR ${value}`} />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#1B5E20"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </RechartsLine>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No sales data available yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Platform Fees & Commissions</h2>
              <CommissionSummary commissions={commissions} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SellerDashboard;
