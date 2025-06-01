
import React from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Store, ShoppingCart } from 'lucide-react';

const SellerDashboard: React.FC = () => (
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

export default SellerDashboard;
