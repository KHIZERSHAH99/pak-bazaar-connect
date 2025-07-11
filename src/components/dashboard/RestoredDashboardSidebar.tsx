
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextFixed';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingCart,
  MessageSquare, 
  Settings,
  Store,
  FileText,
  BarChart3,
  Users,
  Shield
} from 'lucide-react';

interface RestoredDashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const RestoredDashboardSidebar: React.FC<RestoredDashboardSidebarProps> = ({ 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  const { profile } = useAuth();
  const location = useLocation();

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
      { name: 'Profile', path: '/profile', icon: Settings },
      { name: 'Chat Support', path: '/dashboard/chat', icon: MessageSquare },
    ];

    if (profile?.role === 'admin') {
      return [
        ...baseItems,
        { name: 'Users', path: '/dashboard/admin', icon: Users },
        { name: 'Ad Approvals', path: '/dashboard/ad-approvals', icon: FileText },
        { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
      ];
    }

    if (profile?.role === 'wholesaler') {
      return [
        ...baseItems,
        { name: 'My Shops', path: '/dashboard/shops', icon: Store },
        { name: 'Products', path: '/dashboard/products', icon: Package },
        { name: 'Orders', path: '/dashboard/wholesaler-orders', icon: ShoppingCart },
        { name: 'Advertisements', path: '/dashboard/ads', icon: FileText },
        { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
      ];
    }

    if (profile?.role === 'seller') {
      return [
        ...baseItems,
        { name: 'Browse Shops', path: '/dashboard/browse-shops', icon: Store },
        { name: 'My Orders', path: '/dashboard/seller-orders', icon: ShoppingCart },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Mobile Close Button */}
      <div className="flex items-center justify-between p-4 lg:hidden">
        <h2 className="text-lg font-semibold text-gray-900 font-poppins">Menu</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-pakistani_green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {profile?.email?.substring(0, 2).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate font-poppins">
              {profile?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-500 capitalize font-poppins">
              {profile?.role || 'User'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors font-poppins ${
                isActive
                  ? 'bg-pakistani_green-50 text-pakistani_green-700 border-r-2 border-pakistani_green-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive ? 'text-pakistani_green-600' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 font-poppins text-center">
          Pak Bazaar Connect
        </p>
      </div>
    </div>
  );
};

export default RestoredDashboardSidebar;
