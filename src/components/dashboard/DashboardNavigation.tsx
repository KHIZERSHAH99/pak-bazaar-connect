import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { 
  Home, Package, ShoppingCart, MessageSquare, Settings, Store,
  BarChart3, Truck, CreditCard, Ticket, BookOpen, Video
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
  const unreadCount = useUnreadMessages();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const getNavItems = (): NavItem[] => {
    const commonItems: NavItem[] = [
      { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> },
      { name: 'Tutorials', path: '/dashboard/tutorials', icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> },
      { name: 'Profile', path: '/profile', icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> },
      { 
        name: 'Messages', 
        path: '/messages', 
        icon: <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />,
        badge: unreadCount > 0 ? String(unreadCount) : undefined
      },
    ];

    const adminItems: NavItem[] = [
      { name: 'Tutorial Manager', path: '/dashboard/tutorial-manager', icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> },
    ];

    const wholesalerItems: NavItem[] = [
      { name: 'Shops', path: '/dashboard/shops', icon: <Store className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> },
      { name: 'Products', path: '/dashboard/products', icon: <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> },
      { name: 'Shipping', path: '/dashboard/shipping', icon: <Truck className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> },
      { name: 'Orders', path: '/dashboard/wholesaler-orders', icon: <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> },
      { name: 'Coupons', path: '/dashboard/coupons', icon: <Ticket className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> },
      { name: 'Payment', path: '/dashboard/payment', icon: <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> },
      { name: 'Analytics', path: '/dashboard/analytics', icon: <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> },
    ];

    const sellerItems: NavItem[] = [
      { name: 'Browse Shops', path: '/dashboard/browse-shops', icon: <Store className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> },
      { name: 'My Orders', path: '/dashboard/seller-orders', icon: <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> },
    ];

    if (profile?.role === 'admin') return [...commonItems, ...adminItems];
    if (profile?.role === 'wholesaler') return [...commonItems, ...wholesalerItems];
    if (profile?.role === 'seller') return [...commonItems, ...sellerItems];
    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="space-y-0.5">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium group transition-all duration-200 font-poppins touch-manipulation ${
            isActive(item.path)
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <div className="flex items-center">
            {item.icon}
            <span className="text-sm">{item.name}</span>
          </div>
          
          <div className="flex items-center gap-1">
            {item.badge && (
              <Badge className="bg-destructive text-destructive-foreground font-poppins text-[10px] px-1.5 py-0 animate-pulse">
                {item.badge}
              </Badge>
            )}
            <ChevronRight className={`h-3 w-3 sm:h-4 sm:w-4 opacity-0 -translate-x-2 transition-all duration-200 
              ${isActive(item.path) ? 'opacity-100 translate-x-0' : 'group-hover:opacity-50 group-hover:translate-x-0'}`} 
            />
          </div>
        </Link>
      ))}
    </nav>
  );
};

export default DashboardNavigation;
