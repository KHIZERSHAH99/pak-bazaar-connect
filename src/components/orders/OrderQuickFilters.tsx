import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, Package, Truck, XCircle, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Order } from '@/lib/types';

interface OrderQuickFiltersProps {
  orders: Order[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  userRole: 'wholesaler' | 'seller';
}

interface FilterStats {
  count: number;
  totalValue: number;
  percentage: number;
}

const OrderQuickFilters: React.FC<OrderQuickFiltersProps> = ({
  orders,
  activeFilter,
  onFilterChange,
  userRole
}) => {
  const calculateStats = (status?: string): FilterStats => {
    const filteredOrders = status ? orders.filter(order => order.status === status) : orders;
    const count = filteredOrders.length;
    const totalValue = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
    
    return { count, totalValue, percentage };
  };

  const filters = [
    {
      key: 'all',
      label: 'All Orders',
      icon: Package,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      activeColor: 'bg-gray-600 text-white border-gray-600'
    },
    {
      key: 'pending',
      label: 'Pending',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      activeColor: 'bg-yellow-600 text-white border-yellow-600'
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      icon: CheckCircle,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      activeColor: 'bg-blue-600 text-white border-blue-600'
    },
    {
      key: 'processing',
      label: 'Processing',
      icon: Package,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      activeColor: 'bg-purple-600 text-white border-purple-600'
    },
    {
      key: 'shipped',
      label: 'Shipped',
      icon: Truck,
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      activeColor: 'bg-indigo-600 text-white border-indigo-600'
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 border-green-200',
      activeColor: 'bg-green-600 text-white border-green-600'
    },
    {
      key: 'rejected',
      label: 'Rejected',
      icon: XCircle,
      color: 'bg-red-100 text-red-800 border-red-200',
      activeColor: 'bg-red-600 text-white border-red-600'
    }
  ];

  // Quick filter buttons for priority orders
  const priorityFilters = [
    {
      key: 'today',
      label: 'Today',
      icon: Calendar,
      filter: (orders: Order[]) => orders.filter(order => {
        const today = new Date().toDateString();
        return new Date(order.created_at).toDateString() === today;
      })
    },
    {
      key: 'high-value',
      label: 'High Value (>50k)',
      icon: DollarSign,
      filter: (orders: Order[]) => orders.filter(order => (order.total_amount || 0) > 50000)
    },
    {
      key: 'urgent',
      label: 'Needs Attention',
      icon: TrendingUp,
      filter: (orders: Order[]) => orders.filter(order => 
        order.requires_attention || (
          order.status === 'pending' && 
          new Date(order.created_at).getTime() < Date.now() - 24 * 60 * 60 * 1000
        )
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Main Status Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => {
              const stats = calculateStats(filter.key === 'all' ? undefined : filter.key);
              const Icon = filter.icon;
              const isActive = activeFilter === filter.key;
              
              return (
                <Button
                  key={filter.key}
                  variant="outline"
                  size="sm"
                  onClick={() => onFilterChange(filter.key)}
                  className={`h-auto p-3 flex flex-col items-start gap-1 min-w-[120px] ${
                    isActive ? filter.activeColor : filter.color
                  } hover:opacity-80 transition-all`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{filter.label}</span>
                  </div>
                  
                  <div className="flex items-center justify-between w-full text-xs">
                    <Badge variant="secondary" className={`text-xs ${isActive ? 'bg-white/20' : ''}`}>
                      {stats.count}
                    </Badge>
                    {stats.totalValue > 0 && (
                      <span className="opacity-75">
                        Rs. {(stats.totalValue / 1000).toFixed(0)}k
                      </span>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Priority Filters */}
      {userRole === 'wholesaler' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Priority Filters</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {priorityFilters.map(filter => {
                const filteredOrders = filter.filter(orders);
                const Icon = filter.icon;
                
                return (
                  <Button
                    key={filter.key}
                    variant="outline"
                    size="sm"
                    onClick={() => onFilterChange(filter.key)}
                    className={`flex items-center gap-2 ${
                      activeFilter === filter.key 
                        ? 'bg-orange-600 text-white border-orange-600' 
                        : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{filter.label}</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        activeFilter === filter.key ? 'bg-white/20' : ''
                      }`}
                    >
                      {filteredOrders.length}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderQuickFilters;