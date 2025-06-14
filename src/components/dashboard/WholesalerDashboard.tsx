
import React from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Store, Package, FileText, ShoppingCart } from 'lucide-react';

const WholesalerDashboard: React.FC = () => (
  <div className="animate-fadeIn">
    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 font-poppins">Wholesaler Dashboard</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <Link to="/dashboard/shops">
        <Card className="p-4 md:p-6 hover:bg-muted transition-colors cursor-pointer h-full hover:shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mr-4">
              <Store className="h-6 w-6 text-blue-700 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold font-poppins">My Shops</h3>
          </div>
          <p className="text-muted-foreground font-poppins text-sm md:text-base">Manage your wholesale shops and business information.</p>
        </Card>
      </Link>
      
      <Link to="/dashboard/products">
        <Card className="p-4 md:p-6 hover:bg-muted transition-colors cursor-pointer h-full hover:shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mr-4">
              <Package className="h-6 w-6 text-green-700 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold font-poppins">Products</h3>
          </div>
          <p className="text-muted-foreground font-poppins text-sm md:text-base">Add and manage product listings for your shops.</p>
        </Card>
      </Link>
      
      <Link to="/dashboard/ads">
        <Card className="p-4 md:p-6 hover:bg-muted transition-colors cursor-pointer h-full hover:shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full mr-4">
              <FileText className="h-6 w-6 text-purple-700 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold font-poppins">Advertisements</h3>
          </div>
          <p className="text-muted-foreground font-poppins text-sm md:text-base">Create and manage promotional advertisements.</p>
        </Card>
      </Link>
      
      <Link to="/dashboard/wholesaler-orders">
        <Card className="p-4 md:p-6 hover:bg-muted transition-colors cursor-pointer h-full hover:shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full mr-4">
              <ShoppingCart className="h-6 w-6 text-yellow-700 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold font-poppins">Orders</h3>
          </div>
          <p className="text-muted-foreground font-poppins text-sm md:text-base">View and process orders from sellers.</p>
        </Card>
      </Link>
    </div>
  </div>
);

export default WholesalerDashboard;
