
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface OrderCounts {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  rejected: number;
}

interface OrderStatsProps {
  counts: OrderCounts;
}

const OrderStats: React.FC<OrderStatsProps> = ({ counts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-pakistani_green-600">{counts.total}</p>
          <p className="text-sm text-gray-600 font-poppins">Total Orders</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
          <p className="text-sm text-gray-600 font-poppins">Pending</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{counts.confirmed}</p>
          <p className="text-sm text-gray-600 font-poppins">Confirmed</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{counts.completed}</p>
          <p className="text-sm text-gray-600 font-poppins">Completed</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
          <p className="text-sm text-gray-600 font-poppins">Rejected</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStats;
