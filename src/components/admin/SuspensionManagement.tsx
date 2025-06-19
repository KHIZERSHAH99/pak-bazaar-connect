
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Ban, CheckCircle, Search, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SuspendedUser {
  id: string;
  email: string;
  business_name: string;
  role: string;
  is_suspended: boolean;
  suspension_reason: string;
  created_at: string;
  updated_at: string;
}

interface SuspensionManagementProps {
  onRefresh: () => void;
}

const SuspensionManagement: React.FC<SuspensionManagementProps> = ({ onRefresh }) => {
  const [suspendedUsers, setSuspendedUsers] = useState<SuspendedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<SuspendedUser | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSuspendedUsers();
  }, []);

  const loadSuspendedUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_suspended', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSuspendedUsers(data || []);
    } catch (error) {
      console.error('Error loading suspended users:', error);
      toast({
        title: "Error",
        description: "Failed to load suspended users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    try {
      setProcessing(userId);
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspension_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User Unsuspended",
        description: "The user has been successfully unsuspended",
        variant: "default"
      });

      loadSuspendedUsers();
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unsuspend user",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleSuspendUser = async (userId: string, reason: string) => {
    try {
      setProcessing(userId);
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspension_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User Suspended",
        description: "The user has been successfully suspended",
        variant: "default"
      });

      loadSuspendedUsers();
      onRefresh();
      setSelectedUser(null);
      setSuspensionReason('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend user",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const filteredUsers = suspendedUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <Ban className="h-5 w-5 text-red-600" />
            Suspension Management
            <Badge variant="outline" className="ml-2">
              {suspendedUsers.length} suspended
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search suspended users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Suspended Users List */}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500 font-poppins">Loading suspended users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500 font-poppins">
                  {searchTerm ? 'No suspended users found matching your search' : 'No users are currently suspended'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium text-gray-900 font-poppins">
                            {user.business_name || 'Unnamed Business'}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <Badge className="mt-1 bg-red-100 text-red-800">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 ml-8">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Reason:</span> {user.suspension_reason || 'No reason provided'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Suspended on {formatDate(user.updated_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Business Name</label>
                              <p className="text-sm text-gray-900">{user.business_name || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Email</label>
                              <p className="text-sm text-gray-900">{user.email}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Role</label>
                              <p className="text-sm text-gray-900">{user.role}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Suspension Reason</label>
                              <p className="text-sm text-gray-900">{user.suspension_reason || 'No reason provided'}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        onClick={() => handleUnsuspendUser(user.id)}
                        disabled={processing === user.id}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {processing === user.id ? 'Processing...' : 'Unsuspend'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Suspend Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Quick Suspend User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 font-poppins">
                User Email
              </label>
              <Input
                placeholder="Enter user email to suspend..."
                value={selectedUser?.email || ''}
                onChange={(e) => {
                  // This would typically be a search/select component
                  // For now, it's just a placeholder
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 font-poppins">
                Suspension Reason
              </label>
              <Textarea
                placeholder="Enter reason for suspension..."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              onClick={() => {
                if (selectedUser && suspensionReason.trim()) {
                  handleSuspendUser(selectedUser.id, suspensionReason.trim());
                }
              }}
              disabled={!selectedUser || !suspensionReason.trim() || processing === selectedUser?.id}
              className="bg-red-600 hover:bg-red-700"
            >
              <Ban className="h-4 w-4 mr-2" />
              {processing === selectedUser?.id ? 'Processing...' : 'Suspend User'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuspensionManagement;
