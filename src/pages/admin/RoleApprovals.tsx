import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPendingRoleRequests, approveRoleRequest, RoleRequestWithProfile } from '@/lib/admin';
import { useToast } from '@/hooks/use-toast';

const RoleApprovals: React.FC = () => {
  const [requests, setRequests] = useState<RoleRequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getPendingRoleRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch role requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch role requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApproval = async (requestId: string, approve: boolean) => {
    try {
      setProcessing(prev => ({ ...prev, [requestId]: true }));
      await approveRoleRequest(requestId, approve);
      
      toast({
        title: approve ? 'Request Approved' : 'Request Rejected',
        description: approve ? 'User role has been updated' : 'Request has been rejected',
      });

      // Refresh the list
      fetchRequests();
    } catch (error: any) {
      toast({
        title: 'Action Failed',
        description: error.message || 'Failed to process the request',
        variant: 'destructive',
      });
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Role Approval Requests</h1>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : requests.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600">No pending role requests to approve.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{request.profiles.email}</h3>
                    <p className="text-gray-600">
                      Current Role: <span className="font-medium">{request.profiles.role}</span>
                    </p>
                    <p className="text-gray-600">
                      Requested Role: <span className="font-medium">{request.requested_role}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Requested on: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex space-x-4">
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      disabled={processing[request.id]}
                      onClick={() => handleApproval(request.id, false)}
                    >
                      Reject
                    </Button>
                    <Button
                      className="bg-primary hover:bg-pakistani-green-800"
                      disabled={processing[request.id]}
                      onClick={() => handleApproval(request.id, true)}
                    >
                      Approve
                    </Button>
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

const RoleApprovalsWithAuth = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <RoleApprovals />
  </ProtectedRoute>
);

export default RoleApprovalsWithAuth;
