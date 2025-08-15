
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, ShoppingCart, MessageSquare, BarChart3 } from 'lucide-react';

const QuickActions: React.FC = () => {
  const { profile } = useAuth();

  const getQuickActions = () => {
    if (profile?.role === 'wholesaler') {
      return [
        {
          label: 'Add Product',
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/products',
          variant: 'default' as const
        },
        {
          label: 'View Orders',
          icon: <ShoppingCart className="h-4 w-4" />,
          href: '/dashboard/wholesaler-orders',
          variant: 'outline' as const
        },
        {
          label: 'Analytics',
          icon: <BarChart3 className="h-4 w-4" />,
          href: '/dashboard/analytics',
          variant: 'outline' as const
        }
      ];
    } else if (profile?.role === 'seller') {
      return [
        {
          label: 'Browse Shops',
          icon: <Search className="h-4 w-4" />,
          href: '/dashboard/browse-shops',
          variant: 'default' as const
        },
        {
          label: 'My Orders',
          icon: <ShoppingCart className="h-4 w-4" />,
          href: '/dashboard/seller-orders',
          variant: 'outline' as const
        },
        {
          label: 'Support',
          icon: <MessageSquare className="h-4 w-4" />,
          href: '/dashboard/chat',
          variant: 'outline' as const
        }
      ];
    } else if (profile?.role === 'admin') {
      return [
        {
          label: 'Admin Panel',
          icon: <BarChart3 className="h-4 w-4" />,
          href: '/admin',
          variant: 'default' as const
        },
        {
          label: 'Ad Approvals',
          icon: <MessageSquare className="h-4 w-4" />,
          href: '/dashboard/ad-approvals',
          variant: 'outline' as const
        },
        {
          label: 'Support Chat',
          icon: <MessageSquare className="h-4 w-4" />,
          href: '/dashboard/chat',
          variant: 'outline' as const
        }
      ];
    }
    return [];
  };

  const quickActions = getQuickActions();

  if (quickActions.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white font-poppins">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Button
                variant={action.variant}
                className="w-full justify-start h-auto py-3 px-4 font-poppins"
              >
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
