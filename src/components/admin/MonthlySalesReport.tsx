
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getWholesalerMonthlySales } from '@/lib/orders/analytics';
import { supabase } from '@/integrations/supabase/client';

interface WholesalerSalesData {
  wholesaler_id: string;
  business_name: string;
  email: string;
  total_orders: number;
  total_sales: number;
  pending_commission: number;
  paid_commission: number;
}

const MonthlySalesReport: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salesData, setSalesData] = useState<WholesalerSalesData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMonthlySales();
  }, [selectedMonth]);

  const loadMonthlySales = async () => {
    try {
      setLoading(true);
      
      // Get all wholesalers
      const { data: wholesalers, error: wholesalersError } = await supabase
        .from('profiles')
        .select('id, email, business_name')
        .eq('role', 'wholesaler');

      if (wholesalersError) throw wholesalersError;

      // Get sales data for each wholesaler
      const salesPromises = wholesalers.map(async (wholesaler) => {
        try {
          const monthlyData = await getWholesalerMonthlySales(selectedMonth + '-01');
          return {
            wholesaler_id: wholesaler.id,
            business_name: wholesaler.business_name || 'Unnamed Business',
            email: wholesaler.email,
            ...monthlyData
          };
        } catch (error) {
          console.error(`Error fetching sales for ${wholesaler.email}:`, error);
          return {
            wholesaler_id: wholesaler.id,
            business_name: wholesaler.business_name || 'Unnamed Business',
            email: wholesaler.email,
            total_orders: 0,
            total_sales: 0,
            pending_commission: 0,
            paid_commission: 0
          };
        }
      });

      const results = await Promise.all(salesPromises);
      setSalesData(results.filter(data => data.total_orders > 0 || data.total_sales > 0));
      
    } catch (error) {
      console.error('Error loading monthly sales:', error);
      toast({
        title: "Error",
        description: "Failed to load monthly sales report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;
  };

  const getTotalSummary = () => {
    return salesData.reduce((acc, data) => ({
      total_orders: acc.total_orders + data.total_orders,
      total_sales: acc.total_sales + data.total_sales,
      pending_commission: acc.pending_commission + data.pending_commission,
      paid_commission: acc.paid_commission + data.paid_commission
    }), {
      total_orders: 0,
      total_sales: 0,
      pending_commission: 0,
      paid_commission: 0
    });
  };

  const summary = getTotalSummary();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 font-poppins">Monthly Sales Report</h2>
        <div className="flex items-center gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthValue = date.toISOString().slice(0, 7);
                const monthLabel = date.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                });
                return (
                  <SelectItem key={monthValue} value={monthValue}>
                    {monthLabel}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button 
            onClick={loadMonthlySales}
            disabled={loading}
            className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 font-poppins">Total Orders</p>
                <p className="text-2xl font-bold text-blue-800 font-poppins">{summary.total_orders}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 font-poppins">Total Sales</p>
                <p className="text-2xl font-bold text-green-800 font-poppins">
                  {formatCurrency(summary.total_sales)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 font-poppins">Pending Commission</p>
                <p className="text-2xl font-bold text-yellow-800 font-poppins">
                  {formatCurrency(summary.pending_commission)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 font-poppins">Paid Commission</p>
                <p className="text-2xl font-bold text-purple-800 font-poppins">
                  {formatCurrency(summary.paid_commission)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report */}
      <Card>
        <CardHeader>
          <CardTitle className="font-poppins">Wholesaler Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 font-poppins">Loading sales data...</p>
            </div>
          ) : salesData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 font-poppins">No sales data found for selected month</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-700 font-poppins">Wholesaler</th>
                    <th className="text-right p-3 font-medium text-gray-700 font-poppins">Orders</th>
                    <th className="text-right p-3 font-medium text-gray-700 font-poppins">Sales</th>
                    <th className="text-right p-3 font-medium text-gray-700 font-poppins">Pending Commission</th>
                    <th className="text-right p-3 font-medium text-gray-700 font-poppins">Paid Commission</th>
                    <th className="text-center p-3 font-medium text-gray-700 font-poppins">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((data) => (
                    <tr key={data.wholesaler_id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium font-poppins">{data.business_name}</p>
                          <p className="text-xs text-gray-500">{data.email}</p>
                        </div>
                      </td>
                      <td className="text-right p-3 font-poppins">{data.total_orders}</td>
                      <td className="text-right p-3 font-medium font-poppins">
                        {formatCurrency(data.total_sales)}
                      </td>
                      <td className="text-right p-3 text-yellow-700 font-poppins">
                        {formatCurrency(data.pending_commission)}
                      </td>
                      <td className="text-right p-3 text-green-700 font-poppins">
                        {formatCurrency(data.paid_commission)}
                      </td>
                      <td className="text-center p-3">
                        {data.total_sales > 100000 ? (
                          <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                        ) : data.total_sales > 50000 ? (
                          <Badge className="bg-blue-100 text-blue-800">Good</Badge>
                        ) : data.total_sales > 10000 ? (
                          <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Low</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlySalesReport;
