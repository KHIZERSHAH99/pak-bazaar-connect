import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Package, 
  ShoppingCart,
  MessageSquare, 
  Settings,
  Store,
  FileText,
  BarChart3
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactElement;
  badge?: string;
}

interface DashboardNavigationProps {
  onNavigate: () => void;
}

const DashboardNavigation: React.FC<DashboardNavigationProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getNavItems = (): NavItem[] => {
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
        name: 'Analytics', 
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
        path: '/dashboard/seller-orders', 
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

  const navItems = getNavItems();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium group transition-all duration-200 font-poppins ${
            isActive(item.path)
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <div className="flex items-center">
            {item.icon}
            {item.name}
          </div>
          
          {item.badge && (
            <Badge variant="secondary" size="sm" className="ml-2 font-poppins">
              {item.badge}
            </Badge>
          )}
          
          <ChevronRight className={`h-4 w-4 opacity-0 -translate-x-2 transition-all duration-200 
            ${isActive(item.path) ? 'opacity-100 translate-x-0' : 'group-hover:opacity-50 group-hover:translate-x-0'}`} 
          />
        </Link>
      ))}
    </nav>
  );
};

export default DashboardNavigation;
