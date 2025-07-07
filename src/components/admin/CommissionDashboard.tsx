
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { 
  getMonthlyCommissions, 
  getCommissionSettings, 
  updateCommissionSettings, 
  markCommissionPaid 
} from '@/lib/enhanced-payment';
import { MonthlyCommission, CommissionSettings } from '@/types/enhanced-payment';

const CommissionDashboard: React.FC = () => {
  const { toast } = useToast();
  const [commissions, setCommissions] = useState<MonthlyCommission[]>([]);
  const [settings, setSettings] = useState<CommissionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newCommissionRate, setNewCommissionRate] = useState<number>(5);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [commissionsData, settingsData] = await Promise.all([
        getMonthlyCommissions(),
        getCommissionSettings()
      ]);
      
      setCommissions(commissionsData);
      setSettings(settingsData);
      
      if (settingsData) {
        setNewCommissionRate(settingsData.commission_percentage);
      }
    } catch (error) {
      console.error('Error fetching commission data:', error);
      toast({
        title: "Failed to Load Data",
        description: "Unable to fetch commission information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCommissionRate = async () => {
    try {
      await updateCommissionSettings(newCommissionRate);
      
      toast({
        title: "Commission Rate Updated",
        description: `New commission rate set to ${newCommissionRate}%`,
        variant: "default"
      });
      
      setShowSettings(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Failed to Update Commission Rate",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleMarkPaid = async (commissionId: string) => {
    try {
      await markCommissionPaid(commissionId);
      
      toast({
        title: "Commission Marked as Paid",
        description: "The commission has been successfully marked as paid",
        variant: "default"
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Failed to Mark as Paid",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Unpaid</Badge>;
    }
  };

  const totalUnpaid = commissions
    .filter(c => c.payment_status === 'unpaid' || c.payment_status === 'overdue')
    .reduce((sum, c) => sum + c.commission_amount, 0);

  const totalPaid = commissions
    .filter(c => c.payment_status === 'paid')
    .reduce((sum, c) => sum + c.commission_amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">Commission Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-32 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">Commission Management</h1>
        <Button
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
          className="font-poppins"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Commission Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="font-poppins">Commission Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="commissionRate" className="font-poppins">
                  Commission Rate (%)
                </Label>
                <Input
                  id="commissionRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newCommissionRate}
                  onChange={(e) => setNewCommissionRate(parseFloat(e.target.value))}
                  className="font-poppins"
                />
              </div>
              <Button
                onClick={handleUpdateCommissionRate}
                className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
              >
                Update Rate
              </Button>
            </div>
            {settings && (
              <p className="text-sm text-gray-600 mt-2 font-poppins">
                Current rate: {settings.commission_percentage}% (effective from {settings.effective_from})
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-poppins">Total Unpaid</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-poppins">
              PKR {totalUnpaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground font-poppins">
              Pending commission payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-poppins">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-poppins">
              PKR {totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground font-poppins">
              Completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-poppins">Commission Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-poppins">
              {settings?.commission_percentage || 5}%
            </div>
            <p className="text-xs text-muted-foreground font-poppins">
              Current commission rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <DollarSign className="h-5 w-5" />
            Monthly Commission Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-poppins">No commission records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commissions.map((commission) => (
                <div
                  key={commission.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <p className="font-medium font-poppins">
                      {new Date(commission.month).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                    <p className="text-sm text-gray-600 font-poppins">
                      Sales: PKR {commission.total_sales.toLocaleString()} • 
                      Commission: PKR {commission.commission_amount.toLocaleString()} 
                      ({commission.commission_percentage}%)
                    </p>
                    {commission.due_date && (
                      <p className="text-xs text-gray-500 font-poppins">
                        Due: {new Date(commission.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getStatusBadge(commission.payment_status)}
                    {commission.payment_status !== 'paid' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkPaid(commission.id)}
                        className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
                      >
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionDashboard;
