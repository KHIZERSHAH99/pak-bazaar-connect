
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, DollarSign, Settings, Eye } from 'lucide-react';
import { getRoleRequests, approveRoleRequest } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('role-requests');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roleRequests = [], isLoading } = useQuery({
    queryKey: ['role-requests'],
    queryFn: getRoleRequests,
  });

  const approveMutation = useMutation({
    mutationFn: approveRoleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-requests'] });
      toast({
        title: "Role Request Approved",
        description: "The role change has been approved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve role request",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="role-requests" className="font-poppins">
                <Users className="h-4 w-4 mr-2" />
                Role Requests
              </TabsTrigger>
              <TabsTrigger value="preview" className="font-poppins">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="settings" className="font-poppins">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="role-requests">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold font-poppins">Pending Role Requests</h2>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 h-20 rounded"></div>
                    ))}
                  </div>
                ) : roleRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-poppins">No pending role requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {roleRequests.map((request: any) => (
                      <div key={request.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium font-poppins">
                            User ID: {request.user_id}
                          </p>
                          <p className="text-sm text-gray-600 font-poppins">
                            Requested Role: <span className="font-medium">{request.requested_role}</span>
                          </p>
                          <p className="text-xs text-gray-500 font-poppins">
                            Submitted: {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => approveMutation.mutate(request.id)}
                          disabled={approveMutation.isPending}
                          className="bg-pakistani_green-600 text-white px-4 py-2 rounded hover:bg-pakistani_green-700 disabled:opacity-50 font-poppins"
                        >
                          {approveMutation.isPending ? 'Approving...' : 'Approve'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold font-poppins">User Experience Preview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-6 text-center">
                    <h3 className="font-medium mb-4 font-poppins">Wholesaler View</h3>
                    <button
                      onClick={() => window.open('/dashboard?preview=wholesaler', '_blank')}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-poppins"
                    >
                      Preview Dashboard
                    </button>
                  </div>
                  <div className="border rounded-lg p-6 text-center">
                    <h3 className="font-medium mb-4 font-poppins">Seller View</h3>
                    <button
                      onClick={() => window.open('/dashboard?preview=seller', '_blank')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-poppins"
                    >
                      Preview Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold font-poppins">System Settings</h2>
                <div className="border rounded-lg p-6">
                  <p className="text-gray-600 font-poppins">
                    Advanced system settings and configurations will be available here.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
