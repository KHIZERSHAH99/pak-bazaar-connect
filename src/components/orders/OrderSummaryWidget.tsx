import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Clock, 
  CheckCircle,
  Calendar,
  Users
} from 'lucide-react';
import { Order } from '@/lib/types';

interface OrderSummaryWidgetProps {
  orders: Order[];
  userRole: 'wholesaler' | 'seller';
}

const OrderSummaryWidget: React.FC<OrderSummaryWidgetProps> = ({ orders, userRole }) => {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const getOrdersInPeriod = (startDate: Date, endDate?: Date) => {
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return endDate 
        ? orderDate >= startDate && orderDate < endDate
        : orderDate >= startDate;
    });
  };

  const todayOrders = getOrdersInPeriod(today);
  const yesterdayOrders = getOrdersInPeriod(yesterday, today);
  const weekOrders = getOrdersInPeriod(lastWeek);
  const monthOrders = getOrdersInPeriod(lastMonth);

  const calculateTotalValue = (orderList: Order[]) => {
    return orderList.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const todayValue = calculateTotalValue(todayOrders);
  const yesterdayValue = calculateTotalValue(yesterdayOrders);
  const dailyGrowth = calculateGrowth(todayValue, yesterdayValue);

  const weekValue = calculateTotalValue(weekOrders);
  const monthValue = calculateTotalValue(monthOrders);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');

  const avgOrderValue = orders.length > 0 ? calculateTotalValue(orders) / orders.length : 0;

  const uniqueCustomers = new Set(
    orders.map(order => userRole === 'wholesaler' ? order.buyer_id : order.shop_id)
  ).size;

  const metrics = [
    {
      title: 'Today\'s Orders',
      value: todayOrders.length,
      secondaryValue: `Rs. ${(todayValue / 1000).toFixed(0)}k`,
      change: dailyGrowth,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.length,
      secondaryValue: `Rs. ${(calculateTotalValue(pendingOrders) / 1000).toFixed(0)}k`,
      change: null,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Completed Orders',
      value: completedOrders.length,
      secondaryValue: `Rs. ${(calculateTotalValue(completedOrders) / 1000).toFixed(0)}k`,
      change: null,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Average Order Value',
      value: `Rs. ${(avgOrderValue / 1000).toFixed(1)}k`,
      secondaryValue: `${orders.length} total orders`,
      change: null,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  if (userRole === 'wholesaler') {
    metrics.push({
      title: 'Unique Customers',
      value: uniqueCustomers,
      secondaryValue: 'Active buyers',
      change: null,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-full ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                
                {metric.change !== null && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      metric.change >= 0 
                        ? 'text-green-700 bg-green-100' 
                        : 'text-red-700 bg-red-100'
                    }`}
                  >
                    {metric.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(metric.change).toFixed(1)}%
                  </Badge>
                )}
              </div>
              
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                </h3>
                <p className="text-sm text-gray-600 font-medium mt-1">
                  {metric.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {metric.secondaryValue}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OrderSummaryWidget;