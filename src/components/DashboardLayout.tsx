import React, { useState } from 'react';
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
  BarChart3,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactElement;
  badge?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getNavItems = () => {
    const commonItems: NavItem[] = [
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

    const adminItems: NavItem[] = [
      { 
        name: 'Ad Approvals', 
        path: '/dashboard/ad-approvals', 
        icon: <FileText className="w-5 h-5 mr-3" />,
        badge: 'Admin'
      },
    ];

    const wholesalerItems: NavItem[] = [
      { 
        name: 'My Shops', 
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

    const sellerItems: NavItem[] = [
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

  if (loading) {
    return <LoadingScreen />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-grow">
        {/* Mobile sidebar toggle button */}
        <div className="md:hidden fixed bottom-4 right-4 z-30">
          <Button 
            className="rounded-full w-12 h-12 flex items-center justify-center bg-pakistani_green-700 hover:bg-pakistani_green-800 shadow-lg"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Sidebar - shown by default on desktop, toggled on mobile */}
        <aside 
          className={`fixed inset-0 z-20 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out 
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:block bg-white border-r border-gray-200 w-64 flex-shrink-0`}
        >
          {/* Mobile close button */}
          <div className="md:hidden flex justify-end p-4">
            <Button 
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="p-4">
            {profile ? (
              <div className="mb-6 flex flex-col items-center p-4 bg-pakistani_green-50 rounded-lg">
                <Avatar className="h-16 w-16 border-2 border-pakistani_green-100 mb-3">
                  <AvatarFallback className="bg-pakistani_green-700 text-white text-xl">
                    {profile.email?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-medium text-gray-800 mb-1">{profile.email?.split('@')[0]}</p>
                  <Badge variant={
                    profile.role === 'admin' ? 'info' : 
                    profile.role === 'wholesaler' || profile.role === 'seller' ? 'success' : 
                    'pending'
                  } className="capitalize">
                    {profile.role}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="mb-6 flex flex-col items-center">
                <Skeleton className="h-16 w-16 rounded-full mb-3" />
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
            )}

            <h2 className="text-lg font-semibold text-gray-800 mb-4 px-3">Dashboard</h2>
            <nav className="space-y-1">
              {getNavItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium group transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-pakistani_green-700 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    {item.icon}
                    {item.name}
                  </div>
                  
                  {item.badge && (
                    <Badge variant="info" size="sm" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                  
                  <ChevronRight className={`h-4 w-4 opacity-0 -translate-x-2 transition-all duration-200 
                    ${isActive(item.path) ? 'opacity-100 translate-x-0' : 'group-hover:opacity-50 group-hover:translate-x-0'}`} 
                  />
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Semi-transparent overlay on mobile when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        <main className="flex-grow p-4 md:p-6 bg-gray-50">
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
