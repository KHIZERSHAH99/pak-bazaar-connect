
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Clock, CheckCircle, XCircle, Star } from 'lucide-react';

interface OrderStatsProps {
  counts: {
    total: number;
    pending: number;
    confirmed: number;
    rejected: number;
    completed: number;
  };
}

const OrderStats: React.FC<OrderStatsProps> = ({ counts }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{counts.total}</p>
          <p className="text-sm text-gray-600">Total Orders</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{counts.pending}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{counts.confirmed}</p>
          <p className="text-sm text-gray-600">Confirmed</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{counts.rejected}</p>
          <p className="text-sm text-gray-600">Rejected</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{counts.completed}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStats;
