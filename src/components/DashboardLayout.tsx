
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import { 
  Home, 
  Package, 
  ShoppingCart,
  Users, 
  MessageSquare, 
  Settings,
  Store,
  FileText,
  BarChart3 
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { profile } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getNavItems = () => {
    const commonItems = [
      { 
        name: 'Dashboard', 
        path: '/dashboard', 
        icon: <Home className="w-5 h-5 mr-3" /> 
      },
      { 
        name: 'Profile', 
        path: '/profile', 
        icon: <Settings className="w-5 h-5 mr-3" /> 
      },
      { 
        name: 'Chat Support', 
        path: '/dashboard/chat', 
        icon: <MessageSquare className="w-5 h-5 mr-3" /> 
      },
    ];

    const adminItems = [
      { 
        name: 'Role Approvals', 
        path: '/dashboard/role-approvals', 
        icon: <Users className="w-5 h-5 mr-3" /> 
      },
      { 
        name: 'Ad Approvals', 
        path: '/dashboard/ad-approvals', 
        icon: <FileText className="w-5 h-5 mr-3" /> 
      },
    ];

    const wholesalerItems = [
      { 
        name: 'Shops', 
        path: '/dashboard/shops', 
        icon: <Store className="w-5 h-5 mr-3" /> 
      },
      { 
        name: 'Products', 
        path: '/dashboard/products', 
        icon: <Package className="w-5 h-5 mr-3" /> 
      },
      { 
        name: 'Advertisements', 
        path: '/dashboard/ads', 
        icon: <FileText className="w-5 h-5 mr-3" /> 
      },
      { 
        name: 'Orders', 
        path: '/dashboard/wholesaler-orders', 
        icon: <ShoppingCart className="w-5 h-5 mr-3" /> 
      },
      { 
        name: 'Seller Dashboard', 
        path: '/dashboard/seller-dashboard', 
        icon: <BarChart3 className="w-5 h-5 mr-3" /> 
      },
    ];

    const sellerItems = [
      { 
        name: 'Browse Shops', 
        path: '/dashboard/browse-shops', 
        icon: <Store className="w-5 h-5 mr-3" /> 
      },
      { 
        name: 'My Orders', 
        path: '/dashboard/orders', 
        icon: <ShoppingCart className="w-5 h-5 mr-3" /> 
      },
    ];

    if (profile?.role === 'admin') {
      return [...commonItems, ...adminItems];
    } else if (profile?.role === 'wholesaler') {
      return [...commonItems, ...wholesalerItems];
    } else if (profile?.role === 'seller') {
      return [...commonItems, ...sellerItems];
    }

    return commonItems;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-grow">
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Dashboard</h2>
            <nav className="space-y-1">
              {getNavItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-md text-sm font-medium ${
                    isActive(item.path)
                      ? 'bg-pakistani_green-700 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <main className="flex-grow p-6 bg-gray-50">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
