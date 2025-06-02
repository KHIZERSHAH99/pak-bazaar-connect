
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Store, ShoppingCart, ArrowRight, Zap } from 'lucide-react';

const PendingDashboard: React.FC = () => (
  <div className="animate-fadeIn">
    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 font-poppins">Welcome to Pak Bazaar Connect</h1>
    
    <Card className="p-6 mb-6 bg-gradient-to-r from-pakistani_green-50 to-green-50 border-pakistani_green-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-pakistani_green-100 p-3 rounded-full mr-4">
            <Zap className="h-6 w-6 text-pakistani_green-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-poppins text-pakistani_green-800">Choose Your Role - Get Instant Access</h3>
            <p className="text-pakistani_green-700 font-poppins text-sm md:text-base">
              Select your role and start using the platform immediately - no waiting for approval!
            </p>
          </div>
        </div>
        <Link to="/profile">
          <Button className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins">
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
            <p className="font-medium font-poppins">Get instant access</p>
            <p className="text-gray-600 font-poppins text-sm md:text-base">Your role is activated immediately - no waiting for approval!</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-pakistani_green-100 p-2 rounded-full mr-4 h-8 w-8 flex items-center justify-center text-pakistani_green-700 font-bold text-sm">
            3
          </div>
          <div>
            <p className="font-medium font-poppins">Start trading</p>
            <p className="text-gray-600 font-poppins text-sm md:text-base">Begin using all features for your role and start growing your business.</p>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

export default PendingDashboard;

