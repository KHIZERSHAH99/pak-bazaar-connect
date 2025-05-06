import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPendingAds, approveAd } from '@/lib/supabase';
import { Ad } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AdWithProfile extends Ad {
  profiles: {
    id: string;
    email: string;
  };
}

const AdApprovals: React.FC = () => {
  const [ads, setAds] = useState<AdWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const fetchAds = async () => {
    try {
      setLoading(true);
      const data = await getPendingAds();
      setAds(data as AdWithProfile[]);
    } catch (error) {
      console.error('Failed to fetch pending ads:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pending advertisements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleApproval = async (adId: string, approve: boolean) => {
    try {
      setProcessing(prev => ({ ...prev, [adId]: true }));
      await approveAd(adId, approve);
      
      toast({
        title: approve ? 'Ad Approved' : 'Ad Rejected',
        description: approve ? 'Advertisement has been approved and is now active' : 'Advertisement has been rejected',
      });

      // Refresh the list
      fetchAds();
    } catch (error: any) {
      toast({
        title: 'Action Failed',
        description: error.message || 'Failed to process the advertisement',
        variant: 'destructive',
      });
    } finally {
      setProcessing(prev => ({ ...prev, [adId]: false }));
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Advertisement Approval Requests</h1>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : ads.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600">No pending advertisements to approve.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {ads.map((ad) => (
              <Card key={ad.id} className="overflow-hidden">
                <div className="md:flex">
                  {ad.image && (
                    <div className="md:w-1/3 h-48 md:h-auto">
                      <img 
                        src={ad.image} 
                        alt={ad.headline}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/300x200?text=Ad";
                        }}
                      />
                    </div>
                  )}
                  <div className="p-6 md:w-2/3">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{ad.headline}</h3>
                        <p className="text-gray-600 mb-2">
                          Submitted by: <span className="font-medium">{ad.profiles.email}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Submitted on: {new Date(ad.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0 flex space-x-4">
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50"
                          disabled={processing[ad.id]}
                          onClick={() => handleApproval(ad.id, false)}
                        >
                          Reject
                        </Button>
                        <Button
                          className="bg-primary hover:bg-pakistani-green-800"
                          disabled={processing[ad.id]}
                          onClick={() => handleApproval(ad.id, true)}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const AdApprovalsWithAuth = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <AdApprovals />
  </ProtectedRoute>
);

export default AdApprovalsWithAuth;
