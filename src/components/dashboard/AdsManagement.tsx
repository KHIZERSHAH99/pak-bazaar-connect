
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Target, BarChart3 } from 'lucide-react';
import EnhancedCreateAdDialog from '@/components/ads/EnhancedCreateAdDialog';

const AdsManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleAdCreated = () => {
    // Refresh ads list if needed
    console.log('Ad created successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-poppins">Advertisement Campaigns</h1>
          <p className="text-gray-600 mt-1 font-poppins">Create and manage Cost Per Order (CPO) campaigns</p>
        </div>
        <Button 
          className="bg-pakistani_green-700 hover:bg-pakistani_green-800 font-poppins"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <Target className="w-5 h-5" />
              Cost Per Order (CPO)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 font-poppins mb-4">
              Pay only when customers place orders through your advertisements. Set budgets, track performance, and maximize ROI.
            </p>
            <div className="space-y-2 text-sm text-gray-600 font-poppins">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Only pay for actual orders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Set budget caps and daily limits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Auto-stop when limits reached</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins">
              <BarChart3 className="w-5 h-5" />
              Real-time Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 font-poppins mb-4">
              Track campaign performance with detailed analytics and insights to optimize your ad spend.
            </p>
            <div className="space-y-2 text-sm text-gray-600 font-poppins">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Live budget and spend tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Order attribution and CPO metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Campaign performance insights</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <FileText className="w-5 h-5" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-poppins">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
              <h3 className="font-medium mb-1">Choose Product</h3>
              <p className="text-sm text-gray-600">Select a product from your shop to promote</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
              <h3 className="font-medium mb-1">Set Budget</h3>
              <p className="text-sm text-gray-600">Define your budget cap and campaign duration</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
              <h3 className="font-medium mb-1">Track Results</h3>
              <p className="text-sm text-gray-600">Monitor performance and optimize campaigns</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Target className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800 font-poppins">🎯 Special Offer</h3>
            <p className="text-sm text-yellow-700 font-poppins mt-1">
              First 10 wholesalers get FREE ads! Create your first campaign now and start reaching more customers.
            </p>
          </div>
        </div>
      </div>

      <EnhancedCreateAdDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onAdCreated={handleAdCreated}
      />
    </div>
  );
};

export default AdsManagement;
