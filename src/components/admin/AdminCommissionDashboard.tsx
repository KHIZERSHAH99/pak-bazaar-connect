
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContextFixed';
import CommissionOverview from './CommissionOverview';
import CommissionRecordsList from './CommissionRecordsList';
import MonthlySalesReport from './MonthlySalesReport';
import SuspensionManagement from './SuspensionManagement';
import { getAllCommissionRecords, getCommissionSummary } from '@/lib/commission-management';
import { CommissionRecord } from '@/lib/types';

const AdminCommissionDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [commissionRecords, setCommissionRecords] = useState<CommissionRecord[]>([]);
  const [commissionSummary, setCommissionSummary] = useState({
    total_pending: 0,
    total_paid: 0,
    total_amount: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadCommissionData();
    }
  }, [profile, refreshKey]);

  const loadCommissionData = async () => {
    try {
      setLoading(true);
      const [records, summary] = await Promise.all([
        getAllCommissionRecords(),
        getCommissionSummary()
      ]);
      
      setCommissionRecords(records);
      setCommissionSummary(summary);
    } catch (error) {
      console.error('Error loading commission data:', error);
      toast({
        title: "Error",
        description: "Failed to load commission data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6">
          <p className="text-center text-gray-600">Access denied. Admin privileges required.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">Commission Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-pakistani_green-600 text-white rounded-lg hover:bg-pakistani_green-700 transition-colors font-poppins"
        >
          Refresh Data
        </button>
      </div>

      <CommissionOverview summary={commissionSummary} />

      <Tabs defaultValue="records" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="records">Commission Records</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Reports</TabsTrigger>
          <TabsTrigger value="suspensions">Suspensions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="records">
          <CommissionRecordsList 
            records={commissionRecords} 
            onRefresh={handleRefresh}
          />
        </TabsContent>
        
        <TabsContent value="monthly">
          <MonthlySalesReport />
        </TabsContent>
        
        <TabsContent value="suspensions">
          <SuspensionManagement onRefresh={handleRefresh} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Commission Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Advanced analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCommissionDashboard;
