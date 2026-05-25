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
            <CardTitle className="flex items-center gap-2 font-poppins text-sm sm:text-lg p-1 sm:p-0">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-6">
            <p className="text-lg sm:text-2xl font-bold text-primary font-poppins">PKR 0</p>
            <p className="text-xs sm:text-sm text-muted-foreground font-poppins">Total Revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins text-sm sm:text-lg p-1 sm:p-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-6">
            <p className="text-lg sm:text-2xl font-bold text-primary font-poppins">0</p>
            <p className="text-xs sm:text-sm text-muted-foreground font-poppins">Total Orders</p>
          </CardContent>
        </Card>
        
        <Card className="col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins text-sm sm:text-lg p-1 sm:p-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              Products
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-6">
            <p className="text-lg sm:text-2xl font-bold text-primary font-poppins">0</p>
            <p className="text-xs sm:text-sm text-muted-foreground font-poppins">Active Products</p>
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
