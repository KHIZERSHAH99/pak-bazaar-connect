
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Store, Package, FileText, ShoppingCart, Users, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const renderAdminDashboard = () => (
    <div className="animate-fadeIn">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 font-poppins">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Link to="/dashboard/role-approvals">
          <Card className="p-4 md:p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full hover:shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold font-poppins">Role Approvals</h3>
            </div>
            <p className="text-gray-600 font-poppins text-sm md:text-base">Manage and approve role change requests from users.</p>
          </Card>
        </Link>
        
        <Link to="/dashboard/ad-approvals">
          <Card className="p-4 md:p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full hover:shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
              <h3 className="text-lg font-semibold font-poppins">Ad Approvals</h3>
            </div>
            <p className="text-gray-600 font-poppins text-sm md:text-base">Review and approve advertisement submissions from wholesalers.</p>
          </Card>
        </Link>

        <Link to="/dashboard/chat">
          <Card className="p-4 md:p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full hover:shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <MessageSquare className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-lg font-semibold font-poppins">Support Chat</h3>
            </div>
            <p className="text-gray-600 font-poppins text-sm md:text-base">Access the AI chat support to help users with questions.</p>
          </Card>
        </Link>
      </div>
    </div>
  );

  const renderWholesalerDashboard = () => (
    <div className="animate-fadeIn">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 font-poppins">Wholesaler Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Link to="/dashboard/shops">
          <Card className="p-4 md:p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full hover:shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Store className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold font-poppins">My Shops</h3>
            </div>
            <p className="text-gray-600 font-poppins text-sm md:text-base">Manage your wholesale shops and business information.</p>
          </Card>
        </Link>
        
        <Link to="/dashboard/products">
          <Card className="p-4 md:p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full hover:shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Package className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-lg font-semibold font-poppins">Products</h3>
            </div>
            <p className="text-gray-600 font-poppins text-sm md:text-base">Add and manage product listings for your shops.</p>
          </Card>
        </Link>
        
        <Link to="/dashboard/ads">
          <Card className="p-4 md:p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full hover:shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FileText className="h-6 w-6 text-purple-700" />
              </div>
              <h3 className="text-lg font-semibold font-poppins">Advertisements</h3>
            </div>
            <p className="text-gray-600 font-poppins text-sm md:text-base">Create and manage promotional advertisements.</p>
          </Card>
        </Link>
        
        <Link to="/dashboard/wholesaler-orders">
          <Card className="p-4 md:p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full hover:shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <ShoppingCart className="h-6 w-6 text-yellow-700" />
              </div>
              <h3 className="text-lg font-semibold font-poppins">Orders</h3>
            </div>
            <p className="text-gray-600 font-poppins text-sm md:text-base">View and process orders from sellers.</p>
          </Card>
        </Link>
      </div>
    </div>
  );

  const renderSellerDashboard = () => (
    <div className="animate-fadeIn">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 font-poppins">Seller Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Link to="/dashboard/browse-shops">
          <Card className="p-4 md:p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full hover:shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Store className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-lg font-semibold font-poppins">Browse Shops</h3>
            </div>
            <p className="text-gray-600 font-poppins text-sm md:text-base">Find and explore wholesale shops to purchase from.</p>
          </Card>
        </Link>
        
        <Link to="/dashboard/orders">
          <Card className="p-4 md:p-6 hover:bg-gray-50 transition-colors cursor-pointer h-full hover:shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <ShoppingCart className="h-6 w-6 text-yellow-700" />
              </div>
              <h3 className="text-lg font-semibold font-poppins">My Orders</h3>
            </div>
            <p className="text-gray-600 font-poppins text-sm md:text-base">View your purchase history and track orders.</p>
          </Card>
        </Link>
      </div>
    </div>
  );

  const renderPendingDashboard = () => (
    <div className="animate-fadeIn">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 font-poppins">Welcome to Pak Bazaar Connect</h1>
      
      <Card className="p-6 mb-6 bg-gradient-to-r from-pakistani_green-50 to-green-50 border-pakistani_green-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-pakistani_green-100 p-3 rounded-full mr-4">
              <Clock className="h-6 w-6 text-pakistani_green-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-poppins text-pakistani_green-800">Choose Your Role</h3>
              <p className="text-pakistani_green-700 font-poppins text-sm md:text-base">
                Select how you want to use our platform to get started
              </p>
            </div>
          </div>
          <Link to="/profile">
            <Button className="bg-pakistani_green-700 hover:bg-pakistani_green-800 font-poppins">
              Select Role <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 border-2 border-dashed border-gray-200 hover:border-pakistani_green-300 transition-colors">
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Store className="h-8 w-8 text-blue-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2 font-poppins">Become a Wholesaler</h3>
            <p className="text-gray-600 mb-4 font-poppins text-sm md:text-base">
              Sell your products to retailers across Pakistan. Create shops, list products, and manage orders.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 text-left font-poppins">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-2"></div>
                Create and manage multiple shops
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-2"></div>
                List unlimited products
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-2"></div>
                Create promotional ads
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-2"></div>
                Process and fulfill orders
              </li>
            </ul>
          </div>
        </Card>
        
        <Card className="p-6 border-2 border-dashed border-gray-200 hover:border-pakistani_green-300 transition-colors">
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-purple-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2 font-poppins">Become a Seller</h3>
            <p className="text-gray-600 mb-4 font-poppins text-sm md:text-base">
              Purchase products from verified wholesalers. Browse catalogs and place bulk orders.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 text-left font-poppins">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-2"></div>
                Browse wholesale catalogs
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-2"></div>
                Place bulk orders easily
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-2"></div>
                Track order status
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-2"></div>
                Manage inventory purchases
              </li>
            </ul>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 font-poppins">How It Works</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-pakistani_green-100 p-2 rounded-full mr-4 h-8 w-8 flex items-center justify-center text-pakistani_green-700 font-bold text-sm">
              1
            </div>
            <div>
              <p className="font-medium font-poppins">Choose a role</p>
              <p className="text-gray-600 font-poppins text-sm md:text-base">Decide if you want to be a wholesaler or a seller on the platform.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-pakistani_green-100 p-2 rounded-full mr-4 h-8 w-8 flex items-center justify-center text-pakistani_green-700 font-bold text-sm">
              2
            </div>
            <div>
              <p className="font-medium font-poppins">Wait for approval</p>
              <p className="text-gray-600 font-poppins text-sm md:text-base">An admin will review and approve your role request.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-pakistani_green-100 p-2 rounded-full mr-4 h-8 w-8 flex items-center justify-center text-pakistani_green-700 font-bold text-sm">
              3
            </div>
            <div>
              <p className="font-medium font-poppins">Start using the platform</p>
              <p className="text-gray-600 font-poppins text-sm md:text-base">Once approved, you'll have access to all features for your role.</p>
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

const DashboardWithAuth = () => (
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
);

export default DashboardWithAuth;
