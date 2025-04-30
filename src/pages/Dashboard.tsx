
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Store, Package, FileText, ShoppingCart, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const renderAdminDashboard = () => (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/dashboard/role-approvals">
          <Card className="p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold">Role Approvals</h3>
            </div>
            <p className="text-gray-600">Manage and approve role change requests from users.</p>
          </Card>
        </Link>
        
        <Link to="/dashboard/ad-approvals">
          <Card className="p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
              <h3 className="text-lg font-semibold">Ad Approvals</h3>
            </div>
            <p className="text-gray-600">Review and approve advertisement submissions from wholesalers.</p>
          </Card>
        </Link>

        <Link to="/dashboard/chat">
          <Card className="p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <MessageSquare className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-lg font-semibold">Support Chat</h3>
            </div>
            <p className="text-gray-600">Access the AI chat support to help users with questions.</p>
          </Card>
        </Link>
      </div>
    </div>
  );

  const renderWholesalerDashboard = () => (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Wholesaler Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/dashboard/shops">
          <Card className="p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Store className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold">My Shops</h3>
            </div>
            <p className="text-gray-600">Manage your wholesale shops and business information.</p>
          </Card>
        </Link>
        
        <Link to="/dashboard/products">
          <Card className="p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Package className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-lg font-semibold">Products</h3>
            </div>
            <p className="text-gray-600">Add and manage product listings for your shops.</p>
          </Card>
        </Link>
        
        <Link to="/dashboard/ads">
          <Card className="p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
              <h3 className="text-lg font-semibold">Advertisements</h3>
            </div>
            <p className="text-gray-600">Create and manage promotional advertisements.</p>
          </Card>
        </Link>
        
        <Link to="/dashboard/wholesaler-orders">
          <Card className="p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <ShoppingCart className="h-6 w-6 text-yellow-700" />
              </div>
              <h3 className="text-lg font-semibold">Orders</h3>
            </div>
            <p className="text-gray-600">View and process orders from sellers.</p>
          </Card>
        </Link>
      </div>
    </div>
  );

  const renderSellerDashboard = () => (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Seller Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/dashboard/browse-shops">
          <Card className="p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Store className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold">Browse Shops</h3>
            </div>
            <p className="text-gray-600">Find and explore wholesale shops to purchase from.</p>
          </Card>
        </Link>
        
        <Link to="/dashboard/orders">
          <Card className="p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <ShoppingCart className="h-6 w-6 text-yellow-700" />
              </div>
              <h3 className="text-lg font-semibold">My Orders</h3>
            </div>
            <p className="text-gray-600">View your purchase history and track orders.</p>
          </Card>
        </Link>
      </div>
    </div>
  );

  const renderPendingDashboard = () => (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome to Pak Bazaar Connect</h1>
      
      <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-center mb-4">
          <div className="bg-yellow-100 p-3 rounded-full mr-4">
            <Clock className="h-6 w-6 text-yellow-700" />
          </div>
          <h3 className="text-lg font-semibold">Account Pending</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Your account is currently in pending status. Please select a role to access the platform features.
        </p>
        <Link to="/profile" className="btn-primary inline-block">
          Set Your Role
        </Link>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">How It Works</h3>
        <div className="space-y-4">
          <div className="flex">
            <div className="bg-blue-100 p-2 rounded-full mr-4 h-8 w-8 flex items-center justify-center text-blue-700 font-bold">
              1
            </div>
            <div>
              <p className="font-medium">Choose a role</p>
              <p className="text-gray-600">Decide if you want to be a wholesaler or a seller on the platform.</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="bg-blue-100 p-2 rounded-full mr-4 h-8 w-8 flex items-center justify-center text-blue-700 font-bold">
              2
            </div>
            <div>
              <p className="font-medium">Wait for approval</p>
              <p className="text-gray-600">An admin will review and approve your role request.</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="bg-blue-100 p-2 rounded-full mr-4 h-8 w-8 flex items-center justify-center text-blue-700 font-bold">
              3
            </div>
            <div>
              <p className="font-medium">Start using the platform</p>
              <p className="text-gray-600">Once approved, you'll have access to all features for your role.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDashboardContent = () => {
    if (!profile) return null;
    
    switch (profile.role) {
      case 'admin':
        return renderAdminDashboard();
      case 'wholesaler':
        return renderWholesalerDashboard();
      case 'seller':
        return renderSellerDashboard();
      default:
        return renderPendingDashboard();
    }
  };

  return <DashboardLayout>{renderDashboardContent()}</DashboardLayout>;
};

// Import missing icon
import { Clock, MessageSquare } from 'lucide-react';

const DashboardWithAuth = () => (
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
);

export default DashboardWithAuth;
