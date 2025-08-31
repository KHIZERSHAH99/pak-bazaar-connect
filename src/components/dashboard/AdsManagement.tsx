import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Target, BarChart3 } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { getAdsByWholesaler } from '@/lib/ads';
import { Badge } from '@/components/ui/badge';
const AdsManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: ads = [], isLoading, refetch } = useQuery({
    queryKey: ['wholesaler-ads'],
    queryFn: getAdsByWholesaler,
  });
  
  const handleAdCreated = () => {
    refetch();
    console.log('Ad created successfully');
  };
  return <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-poppins">Advertisement Campaigns</h1>
          <p className="text-gray-600 mt-0.5 font-poppins text-xs sm:text-sm">Create and manage Cost Per Order (CPO) campaigns</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 font-poppins text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Create Campaign
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 font-poppins text-sm sm:text-base">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              Cost Per Order (CPO)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <p className="text-gray-600 font-poppins mb-3 text-xs sm:text-sm">
              Pay only when customers place orders through your advertisements. Set budgets, track performance, and maximize ROI.
            </p>
            <div className="space-y-1.5 text-xs sm:text-sm text-gray-600 font-poppins">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Only pay for actual orders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Set budget caps and daily limits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span>Auto-stop when limits reached</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 font-poppins text-sm sm:text-base">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              Real-time Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <p className="text-gray-600 font-poppins mb-3 text-xs sm:text-sm">
              Track campaign performance with detailed analytics and insights to optimize your ad spend.
            </p>
            <div className="space-y-1.5 text-xs sm:text-sm text-gray-600 font-poppins">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                <span>Live budget and spend tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span>Order attribution and CPO metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                <span>Campaign performance insights</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="flex items-center gap-2 font-poppins text-sm sm:text-base">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-poppins">
            <div className="text-center p-3 rounded-lg bg-sky-300/[0.33]">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-1.5 text-xs sm:text-sm font-bold">1</div>
              <h3 className="font-medium mb-0.5 text-xs sm:text-sm">Choose Product</h3>
              <p className="text-xs text-gray-600">Select a product from your shop to promote</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#06f22f]/[0.18]">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-1.5 text-xs sm:text-sm font-bold">2</div>
              <h3 className="font-medium mb-0.5 text-xs sm:text-sm">Set Budget</h3>
              <p className="text-xs text-gray-600">Define your budget cap and campaign duration</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#a42727]/[0.24]">
              <div className="w-6 h-6 sm:w-8 sm:h-8 text-white rounded-full flex items-center justify-center mx-auto mb-1.5 text-xs sm:text-sm font-bold bg-red-800">3</div>
              <h3 className="font-medium mb-0.5 text-xs sm:text-sm">Track Results</h3>
              <p className="text-xs text-gray-600">Monitor performance and optimize campaigns</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
        <div className="flex items-start gap-2">
          <Target className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800 font-poppins text-xs sm:text-sm">🎯 Special Offer</h3>
            <p className="text-xs sm:text-sm text-yellow-700 font-poppins mt-0.5">
              First 10 wholesalers get FREE ads! Create your first campaign now and start reaching more customers.
            </p>
          </div>
        </div>
      </div>

      {/* Active Campaigns Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <Target className="w-5 h-5" />
            Your Active Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-20 rounded"></div>
              ))}
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-poppins">No campaigns created yet</p>
              <p className="text-sm text-gray-400 font-poppins">Create your first campaign to start advertising</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map((ad) => (
                <Card key={ad.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold font-poppins">{ad.headline}</h4>
                          <Badge variant={
                            ad.status === 'active' ? 'default' : 
                            ad.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {ad.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium">Current Spend</p>
                            <p>Rs. {ad.current_spend || 0}</p>
                          </div>
                          <div>
                            <p className="font-medium">Total Orders</p>
                            <p>{ad.total_orders || 0}</p>
                          </div>
                          <div>
                            <p className="font-medium">Budget Cap</p>
                            <p>{ad.budget_cap ? `Rs. ${ad.budget_cap}` : 'No limit'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Created</p>
                            <p>{new Date(ad.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ad creation will be restored later */}
    </div>;
};
export default AdsManagement;