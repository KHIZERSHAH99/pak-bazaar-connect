import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  FileText, 
  Table, 
  Calendar,
  Filter
} from 'lucide-react';
import { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface OrderExportToolsProps {
  orders: Order[];
  userRole: 'wholesaler' | 'seller';
}

const OrderExportTools: React.FC<OrderExportToolsProps> = ({ orders, userRole }) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'id', 'created_at', 'total_amount', 'status', 'buyer_name', 'payment_method'
  ]);
  
  const { toast } = useToast();

  const availableFields = [
    { key: 'id', label: 'Order ID' },
    { key: 'created_at', label: 'Created Date' },
    { key: 'total_amount', label: 'Total Amount' },
    { key: 'status', label: 'Status' },
    { key: 'buyer_name', label: 'Buyer Name' },
    { key: 'buyer_phone', label: 'Buyer Phone' },
    { key: 'buyer_address', label: 'Buyer Address' },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'wholesaler_notes', label: 'Notes' },
    { key: 'shop_name', label: 'Shop Name' }
  ];

  const filterOrdersByDate = (orders: Order[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case 'today':
        return orders.filter(order => new Date(order.created_at) >= today);
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orders.filter(order => new Date(order.created_at) >= weekAgo);
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orders.filter(order => new Date(order.created_at) >= monthAgo);
      case 'quarter':
        const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        return orders.filter(order => new Date(order.created_at) >= quarterAgo);
      default:
        return orders;
    }
  };

  const filterOrdersByStatus = (orders: Order[]) => {
    if (statusFilter === 'all') return orders;
    return orders.filter(order => order.status === statusFilter);
  };

  const getFilteredOrders = () => {
    let filtered = orders;
    filtered = filterOrdersByDate(filtered);
    filtered = filterOrdersByStatus(filtered);
    return filtered;
  };

  const formatOrderData = (order: Order) => {
    const data: any = {};
    
    selectedFields.forEach(field => {
      switch (field) {
        case 'id':
          data['Order ID'] = order.id;
          break;
        case 'created_at':
          data['Created Date'] = new Date(order.created_at).toLocaleDateString();
          break;
        case 'total_amount':
          data['Total Amount'] = order.total_amount;
          break;
        case 'status':
          data['Status'] = order.status;
          break;
        case 'buyer_name':
          data['Buyer Name'] = order.buyer_name || 'N/A';
          break;
        case 'buyer_phone':
          data['Buyer Phone'] = order.buyer_phone || 'N/A';
          break;
        case 'buyer_address':
          data['Buyer Address'] = order.buyer_address || 'N/A';
          break;
        case 'payment_method':
          data['Payment Method'] = order.payment_method || 'N/A';
          break;
        case 'wholesaler_notes':
          data['Notes'] = order.wholesaler_notes || 'N/A';
          break;
        case 'shop_name':
          data['Shop Name'] = order.shops?.name || 'N/A';
          break;
      }
    });
    
    return data;
  };

  const exportToCSV = (data: any[]) => {
    if (data.length === 0) {
      toast({
        title: "No Data to Export",
        description: "No orders match the selected criteria",
        variant: "destructive"
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]?.toString() || '';
          return value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: any[]) => {
    if (data.length === 0) {
      toast({
        title: "No Data to Export",
        description: "No orders match the selected criteria",
        variant: "destructive"
      });
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const filteredOrders = getFilteredOrders();
    const formattedData = filteredOrders.map(formatOrderData);

    if (exportFormat === 'csv') {
      exportToCSV(formattedData);
    } else {
      exportToJSON(formattedData);
    }

    toast({
      title: "Export Successful",
      description: `Exported ${formattedData.length} orders as ${exportFormat.toUpperCase()}`,
      variant: "default"
    });
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const filteredOrdersCount = getFilteredOrders().length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="export-format">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    CSV (Excel)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date-range">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status-filter">Status Filter</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Fields to Export</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {availableFields.map(field => (
              <div key={field.key} className="flex items-center space-x-2">
                <Checkbox
                  id={field.key}
                  checked={selectedFields.includes(field.key)}
                  onCheckedChange={() => handleFieldToggle(field.key)}
                />
                <Label htmlFor={field.key} className="text-sm">
                  {field.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            <Filter className="h-4 w-4 inline mr-1" />
            {filteredOrdersCount} order(s) match the current filters
          </div>
          
          <Button 
            onClick={handleExport}
            disabled={selectedFields.length === 0 || filteredOrdersCount === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export {exportFormat.toUpperCase()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderExportTools;