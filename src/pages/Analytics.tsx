
import React from 'react';
import Layout from '@/components/Layout';
import SellerAnalytics from '@/components/analytics/SellerAnalytics';
import { BarChart } from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <BarChart className="h-8 w-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-gray-900 font-poppins">Analytics Dashboard</h1>
        </div>
        
        <SellerAnalytics />
      </div>
    </Layout>
  );
};

export default Analytics;
