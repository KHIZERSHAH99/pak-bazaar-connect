
import React from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Users, BarChart3, Shield, Store, Package, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AdminDashboard: React.FC = () => {
  // Mock data for demonstration
  const quickStats = {
    totalUsers: 156,
    pendingAds: 8,
    activeShops: 42,
    totalOrders: 234,
    monthlyRevenue: 125000,
    pendingApprovals: 5
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 font-poppins">
        Admin Dashboard
      </h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-poppins">Total Users</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{quickStats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 font-poppins">Active Shops</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">{quickStats.activeShops}</p>
            </div>
            <Store className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </Card>

        <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-poppins">Total Orders</p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{quickStats.totalOrders}</p>
            </div>
            <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </Card>

        <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 dark:text-orange-300 font-poppins">Monthly Revenue</p>
              <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                Rs. {quickStats.monthlyRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </Card>
      </div>

      {/* Pending Actions Alert */}
      {quickStats.pendingApprovals > 0 && (
        <Card className="p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded-full">
                <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 font-poppins">
                  Pending Actions Required
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 font-poppins">
                  You have {quickStats.pendingApprovals} items requiring approval
                </p>
              </div>
            </div>
            <Badge variant="warning">{quickStats.pendingApprovals}</Badge>
          </div>
        </Card>
      )}
      
      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Link to="/admin" className="block">
          <Card className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer h-full hover:shadow-md border-l-4 border-l-blue-500">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                <BarChart3 className="h-6 w-6 text-blue-700 dark:text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold font-poppins text-gray-800 dark:text-gray-200">Admin Panel</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-poppins text-sm md:text-base">
              Comprehensive platform overview and management tools.
            </p>
          </Card>
        </Link>

        <Link to="/dashboard/ad-approvals" className="block">
          <Card className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer h-full hover:shadow-md border-l-4 border-l-purple-500">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
                <FileText className="h-6 w-6 text-purple-700 dark:text-purple-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold font-poppins text-gray-800 dark:text-gray-200">Ad Approvals</h3>
                  {quickStats.pendingAds > 0 && (
                    <Badge variant="destructive">{quickStats.pendingAds}</Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-poppins text-sm md:text-base">
              Review and approve advertisement submissions from wholesalers.
            </p>
          </Card>
        </Link>

        <Link to="/dashboard/chat" className="block">
          <Card className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer h-full hover:shadow-md border-l-4 border-l-green-500">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4">
                <MessageSquare className="h-6 w-6 text-green-700 dark:text-green-300" />
              </div>
              <h3 className="text-lg font-semibold font-poppins text-gray-800 dark:text-gray-200">Support Chat</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-poppins text-sm md:text-base">
              Access the AI chat support to help users with questions.
            </p>
          </Card>
        </Link>

        <Card className="p-4 md:p-6 bg-pakistani_green-50 dark:bg-pakistani_green-900/20 border-pakistani_green-200 dark:border-pakistani_green-700">
          <div className="flex items-center mb-4">
            <div className="bg-pakistani_green-100 dark:bg-pakistani_green-800 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-pakistani_green-700 dark:text-pakistani_green-300" />
            </div>
            <h3 className="text-lg font-semibold font-poppins text-pakistani_green-800 dark:text-pakistani_green-200">
              User Management
            </h3>
          </div>
          <p className="text-pakistani_green-700 dark:text-pakistani_green-300 font-poppins text-sm md:text-base">
            Users can now instantly switch roles without approval. Role changes are immediate and automatic.
          </p>
        </Card>

        <Card className="p-4 md:p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full mr-4">
              <Shield className="h-6 w-6 text-blue-700 dark:text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold font-poppins text-blue-800 dark:text-blue-200">Platform Security</h3>
          </div>
          <p className="text-blue-700 dark:text-blue-300 font-poppins text-sm md:text-base">
            Monitor platform security, user verification, and fraud prevention.
          </p>
        </Card>

        {/* System Health Card */}
        <Card className="p-4 md:p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 dark:bg-green-800 p-3 rounded-full mr-4">
              <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-lg font-semibold font-poppins text-green-800 dark:text-green-200">System Health</h3>
          </div>
          <p className="text-green-700 dark:text-green-300 font-poppins text-sm md:text-base">
            All systems operational. Performance optimized for peak traffic.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
