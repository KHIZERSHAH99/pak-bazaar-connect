
import React from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Store, ShoppingCart } from 'lucide-react';
import QuickActions from './QuickActions';
import DashboardStats from './DashboardStats';

const SellerDashboard: React.FC = () => (
  <div className="animate-fadeIn space-y-6">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 font-poppins">Seller Dashboard</h1>
      <p className="text-muted-foreground font-poppins">Discover suppliers and manage your purchases</p>
    </div>
    
    <DashboardStats />
    <QuickActions />
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <Link to="/dashboard/browse-shops">
        <Card className="p-4 md:p-6 hover:bg-muted transition-all duration-200 cursor-pointer h-full hover:shadow-md group">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mr-4 group-hover:scale-110 transition-transform">
              <Store className="h-6 w-6 text-blue-700 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold font-poppins">Browse Shops</h3>
          </div>
          <p className="text-muted-foreground font-poppins text-sm md:text-base">Find and explore wholesale shops to purchase from.</p>
        </Card>
      </Link>
      
      <Link to="/dashboard/seller-orders">
        <Card className="p-4 md:p-6 hover:bg-muted transition-all duration-200 cursor-pointer h-full hover:shadow-md group">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full mr-4 group-hover:scale-110 transition-transform">
              <ShoppingCart className="h-6 w-6 text-yellow-700 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold font-poppins">My Orders</h3>
          </div>
          <p className="text-muted-foreground font-poppins text-sm md:text-base">View your purchase history and track orders.</p>
        </Card>
      </Link>
    </div>
  </div>
);

export default SellerDashboard;
