
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Store,
  Package,
  ShoppingCart,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  Megaphone
} from 'lucide-react';

interface QuickActionsProps {
  userRole: 'admin' | 'wholesaler' | 'seller' | 'pending';
}

const FixedQuickActions: React.FC<QuickActionsProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNavigation = (path: string, requiresRole?: string) => {
    if (requiresRole && userRole !== requiresRole) {
      toast({
        title: "Access Restricted",
        description: `This feature is only available for ${requiresRole}s`,
        variant: "destructive"
      });
      return;
    }

    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to the requested page",
        variant: "destructive"
      });
    }
  };

  const getActionsForRole = () => {
    switch (userRole) {
      case 'admin':
        return [
          {
            title: 'Manage Users',
            description: 'View and manage all users',
            icon: Users,
            onClick: () => handleNavigation('/dashboard/admin'),
            color: 'bg-blue-500 hover:bg-blue-600'
          },
          {
            title: 'Approve Ads',
            description: 'Review pending advertisements',
            icon: Megaphone,
            onClick: () => handleNavigation('/dashboard/ad-approvals'),
            color: 'bg-purple-500 hover:bg-purple-600'
          },
          {
            title: 'Platform Analytics',
            description: 'View platform statistics',
            icon: BarChart3,
            onClick: () => handleNavigation('/dashboard/analytics'),
            color: 'bg-green-500 hover:bg-green-600'
          },
          {
            title: 'System Settings',
            description: 'Configure platform settings',
            icon: Settings,
            onClick: () => handleNavigation('/dashboard/settings'),
            color: 'bg-gray-500 hover:bg-gray-600'
          }
        ];

      case 'wholesaler':
        return [
          {
            title: 'Create Shop',
            description: 'Set up your wholesale shop',
            icon: Store,
            onClick: () => handleNavigation('/dashboard/shops'),
            color: 'bg-green-500 hover:bg-green-600'
          },
          {
            title: 'Add Products',
            description: 'Add new products to your shop',
            icon: Package,
            onClick: () => handleNavigation('/dashboard/products'),
            color: 'bg-blue-500 hover:bg-blue-600'
          },
          {
            title: 'Create Advertisement',
            description: 'Promote your products',
            icon: Megaphone,
            onClick: () => handleNavigation('/dashboard/ads'),
            color: 'bg-purple-500 hover:bg-purple-600'
          },
          {
            title: 'View Orders',
            description: 'Manage incoming orders',
            icon: ShoppingCart,
            onClick: () => handleNavigation('/dashboard/wholesaler-orders'),
            color: 'bg-orange-500 hover:bg-orange-600'
          },
          {
            title: 'Analytics',
            description: 'View your business analytics',
            icon: BarChart3,
            onClick: () => handleNavigation('/dashboard/seller-dashboard'),
            color: 'bg-indigo-500 hover:bg-indigo-600'
          }
        ];

      case 'seller':
        return [
          {
            title: 'Browse Products',
            description: 'Find products to purchase',
            icon: Package,
            onClick: () => handleNavigation('/dashboard/browse-shops'),
            color: 'bg-green-500 hover:bg-green-600'
          },
          {
            title: 'My Orders',
            description: 'Track your orders',
            icon: ShoppingCart,
            onClick: () => handleNavigation('/dashboard/seller-orders'),
            color: 'bg-blue-500 hover:bg-blue-600'
          },
          {
            title: 'Browse Shops',
            description: 'Explore wholesale shops',
            icon: Store,
            onClick: () => handleNavigation('/dashboard/browse-shops'),
            color: 'bg-purple-500 hover:bg-purple-600'
          },
          {
            title: 'Chat Support',
            description: 'Get help and support',
            icon: MessageSquare,
            onClick: () => handleNavigation('/dashboard/chat'),
            color: 'bg-orange-500 hover:bg-orange-600'
          }
        ];

      default:
        return [
          {
            title: 'Complete Profile',
            description: 'Complete your profile setup',
            icon: Users,
            onClick: () => handleNavigation('/profile'),
            color: 'bg-yellow-500 hover:bg-yellow-600'
          },
          {
            title: 'Contact Support',
            description: 'Get help with your account',
            icon: MessageSquare,
            onClick: () => handleNavigation('/dashboard/chat'),
            color: 'bg-blue-500 hover:bg-blue-600'
          }
        ];
    }
  };

  const actions = getActionsForRole();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={`h-auto p-4 justify-start text-left hover:text-white transition-colors ${action.color}`}
              onClick={action.onClick}
            >
              <div className="flex items-start gap-3">
                <action.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm opacity-80">{action.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FixedQuickActions;
