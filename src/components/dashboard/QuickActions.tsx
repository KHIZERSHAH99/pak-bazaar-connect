
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Search, ShoppingCart, MessageSquare, BarChart3, FileText, Shield } from 'lucide-react';

const QuickActions: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();

  const getQuickActions = () => {
    if (profile?.role === 'wholesaler') {
      return [
        {
          label: t('add_product') || 'Add Product',
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/products',
          variant: 'default' as const,
          description: 'Create new product listings'
        },
        {
          label: t('view_orders') || 'View Orders',
          icon: <ShoppingCart className="h-4 w-4" />,
          href: '/dashboard/wholesaler-orders',
          variant: 'outline' as const,
          description: 'Manage incoming orders'
        },
        {
          label: t('analytics') || 'Analytics',
          icon: <BarChart3 className="h-4 w-4" />,
          href: '/dashboard/seller-dashboard',
          variant: 'outline' as const,
          description: 'View sales performance'
        },
        {
          label: t('support_chat') || 'Support',
          icon: <MessageSquare className="h-4 w-4" />,
          href: '/dashboard/chat',
          variant: 'ghost' as const,
          description: 'Get help and support'
        }
      ];
    } else if (profile?.role === 'seller') {
      return [
        {
          label: t('browse_shops') || 'Browse Shops',
          icon: <Search className="h-4 w-4" />,
          href: '/dashboard/browse-shops',
          variant: 'default' as const,
          description: 'Find wholesalers and suppliers'
        },
        {
          label: t('my_orders') || 'My Orders',
          icon: <ShoppingCart className="h-4 w-4" />,
          href: '/dashboard/seller-orders',
          variant: 'outline' as const,
          description: 'Track your orders'
        },
        {
          label: t('support_chat') || 'Support',
          icon: <MessageSquare className="h-4 w-4" />,
          href: '/dashboard/chat',
          variant: 'ghost' as const,
          description: 'Get help and support'
        }
      ];
    } else if (profile?.role === 'admin') {
      return [
        {
          label: t('admin_panel') || 'Admin Panel',
          icon: <Shield className="h-4 w-4" />,
          href: '/admin',
          variant: 'default' as const,
          description: 'Platform administration'
        },
        {
          label: t('ad_approvals') || 'Ad Approvals',
          icon: <FileText className="h-4 w-4" />,
          href: '/dashboard/ad-approvals',
          variant: 'outline' as const,
          description: 'Review advertisement submissions'
        },
        {
          label: t('support_chat') || 'Support Chat',
          icon: <MessageSquare className="h-4 w-4" />,
          href: '/dashboard/chat',
          variant: 'ghost' as const,
          description: 'Access support system'
        }
      ];
    }
    return [];
  };

  const quickActions = getQuickActions();

  if (quickActions.length === 0) {
    return (
      <Card className="p-6 text-center bg-gray-50 dark:bg-gray-800/50">
        <p className="text-muted-foreground font-poppins">
          {t('no_quick_actions') || 'Complete your profile setup to see quick actions'}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3 font-poppins">
        {t('quick_actions') || 'Quick Actions'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Link key={action.href} to={action.href} className="block">
            <Button 
              variant={action.variant} 
              size="sm" 
              className="w-full h-auto p-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200 font-poppins"
            >
              <div className="flex items-center gap-2">
                {action.icon}
                <span className="font-medium">{action.label}</span>
              </div>
              {action.description && (
                <span className="text-xs opacity-80 text-center">
                  {action.description}
                </span>
              )}
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;
