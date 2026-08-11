import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { 
  Home, Package, ShoppingCart, MessageSquare, Settings, Store,
  BarChart3, Truck, CreditCard, Ticket, BookOpen, Video,
  Shield, Users, Eye, ClipboardList, TrendingUp, Warehouse, MoreHorizontal
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
  collapsible?: boolean;
  defaultOpen?: boolean;
}

interface DashboardNavigationProps {
  onNavigate: () => void;
}

const DashboardNavigation: React.FC<DashboardNavigationProps> = ({ onNavigate }) => {
  const { profile, user } = useAuth();
  const { t, language } = useLanguage();
  const location = useLocation();
  const unreadCount = useUnreadMessages();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const isRtl = language === 'ur';

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

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const iconClass = `w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'} flex-shrink-0`;

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isSectionOpen = (section: NavSection) => {
    if (!section.collapsible) return true;
    if (section.items.some(item => isActive(item.path))) return true;
    return expandedSections[section.label] ?? section.defaultOpen ?? false;
  };

  const getNavSections = (): NavSection[] => {
    if (profile?.role === 'admin') {
      return [
        {
          label: t('general'),
          items: [
            { name: t('dashboard'), path: '/dashboard', icon: <Home className={iconClass} /> },
            { name: t('messages'), path: '/messages', icon: <MessageSquare className={iconClass} />, badge: unreadCount > 0 ? String(unreadCount) : undefined },
          ],
        },
        {
          label: t('adminControls'),
          items: [
            { name: t('adminPanel'), path: '/dashboard/admin', icon: <Shield className={iconClass} /> },
            { name: t('userManagement'), path: '/dashboard/admin/users', icon: <Users className={iconClass} />, badge: pendingRoleRequests > 0 ? String(pendingRoleRequests) : undefined },
            { name: t('orderOversight'), path: '/dashboard/admin/orders', icon: <ClipboardList className={iconClass} />, badge: pendingOrderCount > 0 ? String(pendingOrderCount) : undefined },
            { name: t('moderation'), path: '/dashboard/admin/moderation', icon: <Eye className={iconClass} /> },
            { name: t('platformAnalytics'), path: '/dashboard/admin/analytics', icon: <TrendingUp className={iconClass} /> },
            { name: t('tutorialManager'), path: '/dashboard/tutorial-manager', icon: <Video className={iconClass} /> },
          ],
        },
        {
          label: t('wholesalerView'),
          collapsible: true,
          items: [
            { name: t('shops'), path: '/dashboard/shops', icon: <Store className={iconClass} /> },
            { name: t('products'), path: '/dashboard/products', icon: <Package className={iconClass} /> },
            { name: t('orders'), path: '/dashboard/wholesaler-orders', icon: <ShoppingCart className={iconClass} /> },
            { name: t('inventory'), path: '/dashboard/inventory', icon: <Warehouse className={iconClass} /> },
            { name: t('shipping'), path: '/dashboard/shipping', icon: <Truck className={iconClass} /> },
            { name: t('coupons'), path: '/dashboard/coupons', icon: <Ticket className={iconClass} /> },
            { name: t('payment'), path: '/dashboard/payment', icon: <CreditCard className={iconClass} /> },
            { name: t('analytics'), path: '/dashboard/analytics', icon: <BarChart3 className={iconClass} /> },
          ],
        },
        {
          label: t('sellerView'),
          collapsible: true,
          items: [
            { name: t('browseShopsNav'), path: '/dashboard/browse-shops', icon: <Store className={iconClass} /> },
            { name: t('sellerOrders'), path: '/dashboard/seller-orders', icon: <ShoppingCart className={iconClass} /> },
          ],
        },
      ];
    }

    if (profile?.role === 'wholesaler') {
      return [
        {
          label: t('main'),
          items: [
            { name: t('dashboard'), path: '/dashboard', icon: <Home className={iconClass} /> },
            { name: t('myShop'), path: '/dashboard/shops', icon: <Store className={iconClass} /> },
            { name: t('products'), path: '/dashboard/products', icon: <Package className={iconClass} /> },
            { name: t('orders'), path: '/dashboard/wholesaler-orders', icon: <ShoppingCart className={iconClass} />, badge: pendingOrderCount > 0 ? String(pendingOrderCount) : undefined },
            { name: t('stock'), path: '/dashboard/inventory', icon: <Warehouse className={iconClass} /> },
            { name: t('messages'), path: '/messages', icon: <MessageSquare className={iconClass} />, badge: unreadCount > 0 ? String(unreadCount) : undefined },
          ],
        },
        {
          label: t('moreTools'),
          collapsible: true,
          items: [
            { name: t('shipping'), path: '/dashboard/shipping', icon: <Truck className={iconClass} /> },
            { name: t('coupons'), path: '/dashboard/coupons', icon: <Ticket className={iconClass} /> },
            { name: t('payment'), path: '/dashboard/payment', icon: <CreditCard className={iconClass} /> },
            { name: t('analytics'), path: '/dashboard/analytics', icon: <BarChart3 className={iconClass} /> },
            { name: t('tutorials'), path: '/dashboard/tutorials', icon: <BookOpen className={iconClass} /> },
            { name: t('profile'), path: '/profile', icon: <Settings className={iconClass} /> },
          ],
        },
      ];
    }

    if (profile?.role === 'seller') {
      return [
        {
          label: t('main'),
          items: [
            { name: t('dashboard'), path: '/dashboard', icon: <Home className={iconClass} /> },
            { name: t('browseShopsNav'), path: '/dashboard/browse-shops', icon: <Store className={iconClass} /> },
            { name: t('myOrders'), path: '/dashboard/seller-orders', icon: <ShoppingCart className={iconClass} />, badge: pendingOrderCount > 0 ? String(pendingOrderCount) : undefined },
            { name: t('messages'), path: '/messages', icon: <MessageSquare className={iconClass} />, badge: unreadCount > 0 ? String(unreadCount) : undefined },
            { name: t('tutorials'), path: '/dashboard/tutorials', icon: <BookOpen className={iconClass} /> },
            { name: t('profile'), path: '/profile', icon: <Settings className={iconClass} /> },
          ],
        },
      ];
    }

    // Fallback
    return [
      {
        label: t('general'),
        items: [
          { name: t('dashboard'), path: '/dashboard', icon: <Home className={iconClass} /> },
          { name: t('messages'), path: '/messages', icon: <MessageSquare className={iconClass} />, badge: unreadCount > 0 ? String(unreadCount) : undefined },
          { name: t('profile'), path: '/profile', icon: <Settings className={iconClass} /> },
        ],
      },
    ];
  };

  const sections = getNavSections();
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <nav className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {sections.map((section, sectionIdx) => {
        const open = isSectionOpen(section);
        return (
          <div key={section.label}>
            {sectionIdx > 0 && <Separator className="mb-3" />}
            
            {section.collapsible ? (
              <button
                onClick={() => toggleSection(section.label)}
                className="flex items-center justify-between w-full text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1.5 font-poppins hover:text-foreground transition-colors"
              >
                <span>{section.label}</span>
                {open ? <ChevronDown className="h-3 w-3" /> : <ChevronIcon className="h-3 w-3" />}
              </button>
            ) : (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1.5 font-poppins">
                {section.label}
              </p>
            )}
            
            {open && (
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium group transition-all duration-200 font-poppins touch-manipulation min-h-[44px] ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center min-w-0">
                      {item.icon}
                      <span className="truncate">{item.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {item.badge && (
                        <Badge className="bg-destructive text-destructive-foreground font-poppins text-[10px] px-1.5 py-0 animate-pulse">
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronIcon className={`h-3 w-3 sm:h-4 sm:w-4 opacity-0 -translate-x-2 transition-all duration-200 
                        ${isActive(item.path) ? 'opacity-100 translate-x-0' : 'group-hover:opacity-50 group-hover:translate-x-0'}`} 
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default DashboardNavigation;
