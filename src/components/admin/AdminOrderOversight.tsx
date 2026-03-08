import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2, Package, DollarSign, Clock, AlertTriangle, CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  shipped: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  returned: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  requires_attention: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const AdminOrderOversight: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusOverrideDialog, setStatusOverrideDialog] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState('');
  const [overrideNotes, setOverrideNotes] = useState('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-all-orders', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*, shops(name, owner_id)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: orderStats } = useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: async () => {
      const [total, pending, revenue] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('total_amount').in('status', ['delivered', 'confirmed', 'processing', 'shipped']),
      ]);
      const totalRevenue = (revenue.data || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      return {
        total: total.count || 0,
        pending: pending.count || 0,
        revenue: totalRevenue,
      };
    },
  });

  const overrideOrderStatus = useMutation({
    mutationFn: async ({ orderId, status, notes }: { orderId: string; status: string; notes: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          internal_notes: notes || null,
          last_status_update: new Date().toISOString(),
        })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Order status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
      setStatusOverrideDialog(false);
      setSelectedOrder(null);
      setOverrideNotes('');
    },
    onError: (err: any) => {
      toast({ title: 'Failed to update order', description: err.message, variant: 'destructive' });
    },
  });

  const filteredOrders = orders.filter((o: any) =>
    !search ||
    o.id?.toLowerCase().includes(search.toLowerCase()) ||
    o.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.buyer_phone?.includes(search) ||
    o.shops?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admin', href: '/dashboard/admin' },
        { label: 'Order Oversight' }
      ]} />

      <div>
        <h1 className="text-2xl font-bold text-foreground font-poppins">Order Oversight</h1>
        <p className="text-muted-foreground font-poppins">Monitor and manage all platform orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-poppins">Total Orders</p>
              <p className="text-xl font-bold text-foreground font-poppins">{orderStats?.total || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-poppins">Pending</p>
              <p className="text-xl font-bold text-foreground font-poppins">{orderStats?.pending || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-poppins">Revenue</p>
              <p className="text-xl font-bold text-foreground font-poppins">Rs {(orderStats?.revenue || 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by order ID, buyer, or shop..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="requires_attention">Needs Attention</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-poppins">No orders found</div>
          ) : (
            <div className="divide-y divide-border">
              {filteredOrders.map((order: any) => (
                <div key={order.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p>
                        <Badge className={`text-[10px] ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                          {order.status?.replace('_', ' ')}
                        </Badge>
                        {order.requires_attention && (
                          <Badge variant="destructive" className="text-[10px] gap-1">
                            <AlertTriangle className="h-3 w-3" /> Attention
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="font-medium font-poppins">{order.buyer_name || 'Unknown Buyer'}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-muted-foreground font-poppins">{order.shops?.name || 'Unknown Shop'}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Rs {Number(order.total_amount || 0).toLocaleString()}</span>
                        <span>{format(new Date(order.created_at), 'MMM d, h:mm a')}</span>
                        {order.payment_method && <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder(order);
                        setOverrideStatus(order.status);
                        setStatusOverrideDialog(true);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" /> Override
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Override Dialog */}
      <Dialog open={statusOverrideDialog} onOpenChange={setStatusOverrideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-poppins">Override Order Status</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Order #{selectedOrder.id.slice(0, 8)}</p>
                <p className="font-medium font-poppins">{selectedOrder.buyer_name} — Rs {Number(selectedOrder.total_amount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">New Status</p>
                <Select value={overrideStatus} onValueChange={setOverrideStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'rejected', 'returned'].map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Admin Notes (optional)</p>
                <Textarea
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  placeholder="Reason for override..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOverrideDialog(false)}>Cancel</Button>
            <Button
              onClick={() => selectedOrder && overrideOrderStatus.mutate({
                orderId: selectedOrder.id,
                status: overrideStatus,
                notes: overrideNotes,
              })}
              disabled={overrideOrderStatus.isPending}
            >
              {overrideOrderStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrderOversight;
