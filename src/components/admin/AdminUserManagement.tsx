import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, MoreVertical, Shield, UserX, UserCheck, Mail, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

interface Profile {
  id: string;
  email: string;
  role: string;
  business_name?: string;
  phone_number?: string;
  created_at: string;
  is_suspended?: boolean;
}

const AdminUserManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [roleChangeDialog, setRoleChangeDialog] = useState(false);
  const [newRole, setNewRole] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Profile[];
    },
  });

  const { data: roleRequests = [] } = useQuery({
    queryKey: ['admin-role-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_requests')
        .select('*, profiles!role_requests_user_id_fkey(email, business_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Role updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setRoleChangeDialog(false);
      setSelectedUser(null);
    },
    onError: (err: any) => {
      toast({ title: 'Failed to update role', description: err.message, variant: 'destructive' });
    },
  });

  const approveRoleRequest = useMutation({
    mutationFn: async ({ requestId, userId, role }: { requestId: string; userId: string; role: string }) => {
      const { error: reqErr } = await supabase
        .from('role_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
      if (reqErr) throw reqErr;

      const { error: profErr } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      if (profErr) throw profErr;
    },
    onSuccess: () => {
      toast({ title: 'Role request approved' });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-role-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-role-requests-count'] });
    },
  });

  const rejectRoleRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('role_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Role request rejected' });
      queryClient.invalidateQueries({ queryKey: ['admin-role-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-role-requests-count'] });
    },
  });

  const toggleSuspend = useMutation({
    mutationFn: async ({ userId, suspend }: { userId: string; suspend: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_suspended: suspend,
          suspension_reason: suspend ? 'Suspended by admin' : null,
          suspended_until: null,
        })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (_, { suspend }) => {
      toast({ title: suspend ? 'User suspended' : 'User unsuspended' });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      toast({ title: 'Action failed', description: err.message, variant: 'destructive' });
    },
  });

  const filteredUsers = users.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone_number?.includes(search)
  );
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admin', href: '/dashboard/admin' },
        { label: 'User Management' }
      ]} />

      <div>
        <h1 className="text-2xl font-bold text-foreground font-poppins">User Management</h1>
        <p className="text-muted-foreground font-poppins">Manage all platform users, roles, and access</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: users.length, color: 'text-foreground' },
          { label: 'Wholesalers', value: roleCounts['wholesaler'] || 0, color: 'text-emerald-600' },
          { label: 'Sellers', value: roleCounts['seller'] || 0, color: 'text-blue-600' },
          { label: 'Admins', value: roleCounts['admin'] || 0, color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-poppins">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color} font-poppins`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Role Requests */}
      {roleRequests.length > 0 && (
        <Card className="border-amber-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-poppins flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              Pending Role Requests ({roleRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {roleRequests.map((req: any) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm font-poppins">{req.profiles?.email || req.user_id}</p>
                  <p className="text-xs text-muted-foreground font-poppins">
                    Wants to become <Badge variant="outline" className="ml-1 capitalize">{req.requested_role}</Badge>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => approveRoleRequest.mutate({ requestId: req.id, userId: req.user_id, role: req.requested_role })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <UserCheck className="h-3 w-3 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => rejectRoleRequest.mutate(req.id)}
                  >
                    <UserX className="h-3 w-3 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="wholesaler">Wholesaler</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-poppins">No users found</div>
          ) : (
            <div className="divide-y divide-border">
              {filteredUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="text-xs font-medium">
                        {u.business_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate font-poppins">{u.business_name || u.email}</p>
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize text-[10px] shrink-0">
                          {u.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{u.email}</span>
                        <span className="flex items-center gap-1 hidden sm:flex"><Calendar className="h-3 w-3" />{format(new Date(u.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedUser(u); setNewRole(u.role); setRoleChangeDialog(true); }}>
                        <Shield className="h-4 w-4 mr-2" /> Change Role
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <UserX className="h-4 w-4 mr-2" /> Suspend User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={roleChangeDialog} onOpenChange={setRoleChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-poppins">Change User Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">User</p>
                <p className="font-medium font-poppins">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">New Role</p>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="wholesaler">Wholesaler</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleChangeDialog(false)}>Cancel</Button>
            <Button
              onClick={() => selectedUser && updateRole.mutate({ userId: selectedUser.id, role: newRole })}
              disabled={updateRole.isPending || newRole === selectedUser?.role}
            >
              {updateRole.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;
