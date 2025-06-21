
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, ShoppingCart, MessageSquare, BarChart3, Settings } from 'lucide-react';

const QuickActions: React.FC = () => {
  const { profile } = useAuth();

  const getQuickActions = () => {
    if (profile?.role === 'wholesaler') {
      return [
        {
          label: 'Add Product',
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/products',
          variant: 'default' as const,
          description: 'Add new products to your inventory'
        },
        {
          label: 'View Orders',
          icon: <ShoppingCart className="h-4 w-4" />,
          href: '/dashboard/wholesaler-orders',
          variant: 'outline' as const,
          description: 'Manage incoming orders'
        },
        {
          label: 'My Shops',
          icon: <Settings className="h-4 w-4" />,
          href: '/dashboard/shops',
          variant: 'outline' as const,
          description: 'Manage your shop settings'
        }
      ];
    } else if (profile?.role === 'seller') {
      return [
        {
          label: 'Browse Shops',
          icon: <Search className="h-4 w-4" />,
          href: '/dashboard/browse-shops',
          variant: 'default' as const,
          description: 'Find wholesale suppliers'
        },
        {
          label: 'My Orders',
          icon: <ShoppingCart className="h-4 w-4" />,
          href: '/dashboard/seller-orders',
          variant: 'outline' as const,
          description: 'Track your orders'
        },
        {
          label: 'Support',
          icon: <MessageSquare className="h-4 w-4" />,
          href: '/dashboard/chat',
          variant: 'outline' as const,
          description: 'Get help and support'
        }
      ];
    } else if (profile?.role === 'admin') {
      return [
        {
          label: 'Admin Panel',
          icon: <BarChart3 className="h-4 w-4" />,
          href: '/admin',
          variant: 'default' as const,
          description: 'Manage platform settings'
        },
        {
          label: 'Role Requests',
          icon: <Settings className="h-4 w-4" />,
          href: '/admin/role-requests',
          variant: 'outline' as const,
          description: 'Approve user role changes'
        },
        {
          label: 'Support Chat',
          icon: <MessageSquare className="h-4 w-4" />,
          href: '/dashboard/chat',
          variant: 'outline' as const,
          description: 'Help users with issues'
        }
      ];
    }
    return [];
  };

  const quickActions = getQuickActions();

  if (quickActions.length === 0) return null;

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4 font-poppins">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.href}>
            <Button
              variant={action.variant}
              className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:scale-105 transition-transform"
            >
              {action.icon}
              <span className="font-medium font-poppins">{action.label}</span>
              <span className="text-xs text-muted-foreground text-center font-poppins">
                {action.description}
              </span>
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;
