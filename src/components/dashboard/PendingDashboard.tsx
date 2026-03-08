
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Store, ShoppingCart, ArrowRight, UserCheck } from 'lucide-react';

const PendingDashboard: React.FC = () => (
  <div className="animate-fadeIn">
    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 font-poppins">Complete Your Profile Setup</h1>
    
    <Card className="p-6 mb-6 bg-gradient-to-r from-pakistani_green-50 to-green-50 dark:from-pakistani_green-900/30 dark:to-green-900/30 border-pakistani_green-200 dark:border-pakistani_green-800">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-pakistani_green-100 dark:bg-pakistani_green-800/50 p-3 rounded-full mr-4">
            <UserCheck className="h-6 w-6 text-pakistani_green-700 dark:text-pakistani_green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-poppins text-pakistani_green-800 dark:text-pakistani_green-200">One More Step to Get Started</h3>
            <p className="text-pakistani_green-700 dark:text-pakistani_green-300 font-poppins text-sm md:text-base">
              Choose your business role to unlock all platform features and start trading immediately.
            </p>
          </div>
        </div>
        <Link to="/profile">
          <Button className="font-poppins">
            Choose Role <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="p-6 border-2 border-dashed border-muted hover:border-pakistani_green-300 dark:hover:border-pakistani_green-700 transition-colors">
        <div className="text-center">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Store className="h-8 w-8 text-blue-700 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 font-poppins">Become a Wholesaler</h3>
          <p className="text-muted-foreground mb-4 font-poppins text-sm md:text-base">
            Sell your products to retailers across Pakistan. Create shops, list products, and manage orders.
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 text-left font-poppins">
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
      
      <Card className="p-6 border-2 border-dashed border-muted hover:border-pakistani_green-300 dark:hover:border-pakistani_green-700 transition-colors">
        <div className="text-center">
          <div className="bg-purple-100 dark:bg-purple-900/50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 text-purple-700 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 font-poppins">Become a Seller</h3>
          <p className="text-muted-foreground mb-4 font-poppins text-sm md:text-base">
            Purchase products from verified wholesalers. Browse catalogs and place bulk orders.
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 text-left font-poppins">
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
      <h3 className="text-lg font-semibold mb-4 font-poppins">Quick Setup Process</h3>
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="bg-pakistani_green-100 dark:bg-pakistani_green-800/50 p-2 rounded-full mr-4 h-8 w-8 flex items-center justify-center text-pakistani_green-700 dark:text-pakistani_green-400 font-bold text-sm">
            1
          </div>
          <div>
            <p className="font-medium font-poppins">Select your business role</p>
            <p className="text-muted-foreground font-poppins text-sm md:text-base">Choose whether you want to sell products or purchase from suppliers.</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-pakistani_green-100 dark:bg-pakistani_green-800/50 p-2 rounded-full mr-4 h-8 w-8 flex items-center justify-center text-pakistani_green-700 dark:text-pakistani_green-400 font-bold text-sm">
            2
          </div>
          <div>
            <p className="font-medium font-poppins">Access unlocked immediately</p>
            <p className="text-muted-foreground font-poppins text-sm md:text-base">Your dashboard and features become available instantly after role selection.</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-pakistani_green-100 dark:bg-pakistani_green-800/50 p-2 rounded-full mr-4 h-8 w-8 flex items-center justify-center text-pakistani_green-700 dark:text-pakistani_green-400 font-bold text-sm">
            3
          </div>
          <div>
            <p className="font-medium font-poppins">Start trading today</p>
            <p className="text-muted-foreground font-poppins text-sm md:text-base">Begin creating shops, listing products, or browsing suppliers right away.</p>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

export default PendingDashboard;
