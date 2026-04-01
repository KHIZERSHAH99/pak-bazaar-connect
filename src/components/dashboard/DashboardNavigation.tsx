import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { 
  Home, Package, ShoppingCart, MessageSquare, Settings, Store,
  BarChart3, Truck, CreditCard, Ticket, BookOpen, Video,
  Shield, Users, Eye, ClipboardList, AlertTriangle, TrendingUp, Warehouse
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactElement;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface DashboardNavigationProps {
  onNavigate: () => void;
}

const DashboardNavigation: React.FC<DashboardNavigationProps> = ({ onNavigate }) => {
  const { profile, user } = useAuth();
  const location = useLocation();
  const unreadCount = useUnreadMessages();

  const { data: pendingOrderCount = 0 } = useQuery({
    queryKey: ['pending-order-count', user?.id, profile?.role],
    queryFn: async () => {
      if (!user?.id) return 0;
      if (profile?.role === 'admin') {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'requires_attention']);
        return count || 0;
      }
      if (profile?.role === 'seller') {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', user.id)
          .in('status', ['pending', 'confirmed', 'processing']);
        return count || 0;
      }
      if (profile?.role === 'wholesaler') {
        const { data: shops } = await supabase
          .from('shops')
          .select('id')
          .eq('owner_id', user.id);
        if (!shops?.length) return 0;
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .in('shop_id', shops.map(s => s.id))
          .in('status', ['pending', 'requires_attention']);
        return count || 0;
      }
      return 0;
    },
    enabled: !!user?.id,
    refetchInterval: 60000,
  });

  const { data: pendingRoleRequests = 0 } = useQuery({
    queryKey: ['pending-role-requests-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('role_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      return count || 0;
    },
    enabled: profile?.role === 'admin',
    refetchInterval: 60000,
  });

  const { data: pendingAds = 0 } = useQuery({
    queryKey: ['pending-ads-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('ads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      return count || 0;
    },
    enabled: profile?.role === 'admin',
    refetchInterval: 60000,
  });

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const iconClass = "w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3";

  const getNavSections = (): NavSection[] => {
    const commonSection: NavSection = {
      label: 'General',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: <Home className={iconClass} /> },
        { name: 'Messages', path: '/messages', icon: <MessageSquare className={iconClass} />, badge: unreadCount > 0 ? String(unreadCount) : undefined },
        { name: 'Tutorials', path: '/dashboard/tutorials', icon: <BookOpen className={iconClass} /> },
        { name: 'Profile', path: '/profile', icon: <Settings className={iconClass} /> },
      ],
    };

    if (profile?.role === 'admin') {
      const adminSection: NavSection = {
        label: 'Admin Controls',
        items: [
          { name: 'Admin Panel', path: '/dashboard/admin', icon: <Shield className={iconClass} /> },
          { name: 'User Management', path: '/dashboard/admin/users', icon: <Users className={iconClass} />, badge: pendingRoleRequests > 0 ? String(pendingRoleRequests) : undefined },
          { name: 'Order Oversight', path: '/dashboard/admin/orders', icon: <ClipboardList className={iconClass} />, badge: pendingOrderCount > 0 ? String(pendingOrderCount) : undefined },
          { name: 'Moderation', path: '/dashboard/admin/moderation', icon: <Eye className={iconClass} />, badge: pendingAds > 0 ? String(pendingAds) : undefined },
          { name: 'Platform Analytics', path: '/dashboard/admin/analytics', icon: <TrendingUp className={iconClass} /> },
          { name: 'Tutorial Manager', path: '/dashboard/tutorial-manager', icon: <Video className={iconClass} /> },
        ],
      };

      const wholesalerSection: NavSection = {
        label: 'Wholesaler View',
        items: [
          { name: 'Shops', path: '/dashboard/shops', icon: <Store className={iconClass} /> },
          { name: 'Products', path: '/dashboard/products', icon: <Package className={iconClass} /> },
          { name: 'Shipping', path: '/dashboard/shipping', icon: <Truck className={iconClass} /> },
          { name: 'Wholesaler Orders', path: '/dashboard/wholesaler-orders', icon: <ShoppingCart className={iconClass} /> },
          { name: 'Coupons', path: '/dashboard/coupons', icon: <Ticket className={iconClass} /> },
          { name: 'Payment', path: '/dashboard/payment', icon: <CreditCard className={iconClass} /> },
           { name: 'Analytics', path: '/dashboard/analytics', icon: <BarChart3 className={iconClass} /> },
            { name: 'Inventory', path: '/dashboard/inventory', icon: <Warehouse className={iconClass} /> },
          ],
        };

      const sellerSection: NavSection = {
        label: 'Seller View',
        items: [
          { name: 'Browse Shops', path: '/dashboard/browse-shops', icon: <Store className={iconClass} /> },
          { name: 'Seller Orders', path: '/dashboard/seller-orders', icon: <ShoppingCart className={iconClass} /> },
        ],
      };

      return [commonSection, adminSection, wholesalerSection, sellerSection];
    }

    if (profile?.role === 'wholesaler') {
      return [
        commonSection,
        {
          label: 'Manage',
          items: [
            { name: 'Shops', path: '/dashboard/shops', icon: <Store className={iconClass} /> },
            { name: 'Products', path: '/dashboard/products', icon: <Package className={iconClass} /> },
            { name: 'Shipping', path: '/dashboard/shipping', icon: <Truck className={iconClass} /> },
            { name: 'Orders', path: '/dashboard/wholesaler-orders', icon: <ShoppingCart className={iconClass} />, badge: pendingOrderCount > 0 ? String(pendingOrderCount) : undefined },
            { name: 'Coupons', path: '/dashboard/coupons', icon: <Ticket className={iconClass} /> },
            { name: 'Payment', path: '/dashboard/payment', icon: <CreditCard className={iconClass} /> },
            { name: 'Analytics', path: '/dashboard/analytics', icon: <BarChart3 className={iconClass} /> },
            { name: 'Inventory', path: '/dashboard/inventory', icon: <Warehouse className={iconClass} /> },
          ],
        },
      ];
    }

    if (profile?.role === 'seller') {
      return [
        commonSection,
        {
          label: 'Shopping',
          items: [
            { name: 'Browse Shops', path: '/dashboard/browse-shops', icon: <Store className={iconClass} /> },
            { name: 'My Orders', path: '/dashboard/seller-orders', icon: <ShoppingCart className={iconClass} />, badge: pendingOrderCount > 0 ? String(pendingOrderCount) : undefined },
          ],
        },
      ];
    }

    return [commonSection];
  };

  const sections = getNavSections();

  return (
    <nav className="space-y-4">
      {sections.map((section, sectionIdx) => (
        <div key={section.label}>
          {sectionIdx > 0 && <Separator className="mb-3" />}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1.5 font-poppins">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => (
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
                <div className="flex items-center min-w-0">
                  {item.icon}
                  <span className="text-sm truncate">{item.name}</span>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
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
          </div>
        </div>
      ))}
    </nav>
  );
};

export default DashboardNavigation;
