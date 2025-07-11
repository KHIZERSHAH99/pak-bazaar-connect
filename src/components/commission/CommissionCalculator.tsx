
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContextFixed';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Calculator, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommissionData {
  id: string;
  wholesaler_id: string;
  month: string;
  total_sales: number;
  commission_amount: number;
  commission_percentage: number;
  payment_status: string;
  due_date: string;
  paid_at?: string;
}

interface CommissionCalculatorProps {
  userRole: 'admin' | 'wholesaler';
  wholesalerId?: string;
}

const CommissionCalculator: React.FC<CommissionCalculatorProps> = ({ userRole, wholesalerId }) => {
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCommissions();
    setSelectedMonth(new Date().toISOString().slice(0, 7)); // Current month
  }, [profile, wholesalerId]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('monthly_commissions')
        .select('*');

      if (userRole === 'wholesaler') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        query = query.eq('wholesaler_id', user.id);
      } else if (wholesalerId) {
        query = query.eq('wholesaler_id', wholesalerId);
      }

      const { data, error: fetchError } = await query
        .order('month', { ascending: false })
        .limit(12); // Last 12 months

      if (fetchError) {
        throw fetchError;
      }

      setCommissions(data || []);
    } catch (error: any) {
      console.error('Error fetching commissions:', error);
      setError(error.message || 'Failed to load commission data');
      setCommissions([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyCommissions = async () => {
    if (!selectedMonth) return;

    try {
      setCalculating(true);
      setError(null);

      const targetDate = new Date(selectedMonth + '-01');
      
      // Call the Supabase function to calculate commissions
      const { error } = await supabase.rpc('calculate_monthly_commissions', {
        target_month: targetDate.toISOString().split('T')[0]
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Commission Calculated",
        description: `Monthly commissions for ${selectedMonth} have been calculated successfully.`,
      });

      // Refresh the data
      await fetchCommissions();
    } catch (error: any) {
      console.error('Error calculating commissions:', error);
      setError(error.message || 'Failed to calculate commissions');
      toast({
        title: "Calculation Failed",
        description: error.message || 'Failed to calculate monthly commissions',
        variant: "destructive"
      });
    } finally {
      setCalculating(false);
    }
  };

  const markCommissionPaid = async (commissionId: string) => {
    try {
      const { error } = await supabase
        .from('monthly_commissions')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', commissionId);

      if (error) throw error;

      toast({
        title: "Commission Marked as Paid",
        description: "The commission has been marked as paid successfully.",
      });

      await fetchCommissions();
    } catch (error: any) {
      console.error('Error marking commission as paid:', error);
      toast({
        title: "Update Failed",
        description: error.message || 'Failed to update commission status',
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      unpaid: { variant: 'secondary' as const, icon: Clock, text: 'Unpaid' },
      paid: { variant: 'default' as const, icon: CheckCircle, text: 'Paid' },
      overdue: { variant: 'destructive' as const, icon: AlertCircle, text: 'Overdue' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Commission Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Commission Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userRole === 'admin' && (
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="month" className="block text-sm font-medium mb-2">
                  Calculate for Month
                </label>
                <input
                  type="month"
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <Button 
                onClick={calculateMonthlyCommissions}
                disabled={calculating || !selectedMonth}
                className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
              >
                {calculating ? 'Calculating...' : 'Calculate Commissions'}
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Commission History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Commission Data</h3>
              <p className="text-gray-500">
                {userRole === 'admin' 
                  ? 'Calculate monthly commissions to see data here.'
                  : 'Commission data will appear once you have completed sales.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {commissions.map((commission) => (
                <Card key={commission.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">
                            {new Date(commission.month).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </h3>
                          {getStatusBadge(commission.payment_status)}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Total Sales:</strong> PKR {commission.total_sales.toLocaleString()}</p>
                          <p><strong>Commission ({commission.commission_percentage}%):</strong> PKR {commission.commission_amount.toLocaleString()}</p>
                          <p><strong>Due Date:</strong> {new Date(commission.due_date).toLocaleDateString()}</p>
                          {commission.paid_at && (
                            <p><strong>Paid On:</strong> {new Date(commission.paid_at).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>

                      {userRole === 'admin' && commission.payment_status === 'unpaid' && (
                        <Button
                          onClick={() => markCommissionPaid(commission.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionCalculator;
