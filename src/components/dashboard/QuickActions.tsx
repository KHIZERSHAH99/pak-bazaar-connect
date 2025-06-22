import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, ShoppingCart, MessageSquare, BarChart3 } from 'lucide-react';
const QuickActions: React.FC = () => {
  const {
    profile
  } = useAuth();
  const getQuickActions = () => {
    if (profile?.role === 'wholesaler') {
      return [{
        label: 'Add Product',
        icon: <Plus className="h-4 w-4" />,
        href: '/dashboard/products',
        variant: 'default' as const
      }, {
        label: 'View Orders',
        icon: <ShoppingCart className="h-4 w-4" />,
        href: '/dashboard/wholesaler-orders',
        variant: 'outline' as const
      }, {
        label: 'Analytics',
        icon: <BarChart3 className="h-4 w-4" />,
        href: '/dashboard/seller-dashboard',
        variant: 'outline' as const
      }];
    } else if (profile?.role === 'seller') {
      return [{
        label: 'Browse Shops',
        icon: <Search className="h-4 w-4" />,
        href: '/dashboard/browse-shops',
        variant: 'default' as const
      }, {
        label: 'My Orders',
        icon: <ShoppingCart className="h-4 w-4" />,
        href: '/dashboard/seller-orders',
        variant: 'outline' as const
      }, {
        label: 'Support',
        icon: <MessageSquare className="h-4 w-4" />,
        href: '/dashboard/chat',
        variant: 'outline' as const
      }];
    } else if (profile?.role === 'admin') {
      return [{
        label: 'Admin Panel',
        icon: <BarChart3 className="h-4 w-4" />,
        href: '/admin',
        variant: 'default' as const
      }, {
        label: 'Ad Approvals',
        icon: <MessageSquare className="h-4 w-4" />,
        href: '/dashboard/ad-approvals',
        variant: 'outline' as const
      }, {
        label: 'Support Chat',
        icon: <MessageSquare className="h-4 w-4" />,
        href: '/dashboard/chat',
        variant: 'outline' as const
      }];
    }
    return [];
  };
  const quickActions = getQuickActions();
  if (quickActions.length === 0) return null;
  return;
};
export default QuickActions;