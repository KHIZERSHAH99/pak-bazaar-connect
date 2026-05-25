import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Package } from 'lucide-react';

const SellerAnalytics: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-3xl font-bold text-foreground font-poppins">Analytics</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins text-lg">
              <BarChart3 className="w-5 h-5" />
              Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary font-poppins">PKR 0</p>
            <p className="text-sm text-muted-foreground font-poppins">Total Revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins text-lg">
              <TrendingUp className="w-5 h-5" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary font-poppins">0</p>
            <p className="text-sm text-muted-foreground font-poppins">Total Orders</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins text-lg">
              <Package className="w-5 h-5" />
              Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary font-poppins">0</p>
            <p className="text-sm text-muted-foreground font-poppins">Active Products</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-poppins">Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 font-poppins">
            Track your business performance, monitor sales trends, and analyze customer behavior.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-poppins text-sm">
              📊 Analytics will appear here once you start making sales. Add products and create ads to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerAnalytics;
