
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Store, Package, MessageSquare, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const adminStats = [
    {
      title: 'Total Users',
      value: '150+',
      icon: <Users className="w-8 h-8 text-blue-600" />,
      description: 'Registered users',
      href: '/admin/users'
    },
    {
      title: 'Active Shops',
      value: '45',
      icon: <Store className="w-8 h-8 text-green-600" />,
      description: 'Verified shops',
      href: '/admin/shops'
    },
    {
      title: 'Products Listed',
      value: '320+',
      icon: <Package className="w-8 h-8 text-purple-600" />,
      description: 'Active products',
      href: '/admin/products'
    },
    {
      title: 'Pending Approvals',
      value: '12',
      icon: <MessageSquare className="w-8 h-8 text-orange-600" />,
      description: 'Need review',
      href: '/admin/approvals'
    }
  ];

  const quickActions = [
    { label: 'User Management', href: '/admin/users', description: 'Manage user accounts and roles' },
    { label: 'Shop Verification', href: '/admin/shops', description: 'Verify and manage shops' },
    { label: 'Product Moderation', href: '/admin/products', description: 'Review and moderate products' },
    { label: 'System Analytics', href: '/admin/analytics', description: 'View platform statistics' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-poppins">Admin Panel</h1>
            <p className="text-muted-foreground font-poppins">Manage and monitor the platform</p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Administrator
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminStats.map((stat, index) => (
            <Link key={index} to={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}>
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 justify-start hover:bg-accent"
                  >
                    <div className="text-left">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-sm text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">New wholesaler registration</p>
                  <p className="text-sm text-muted-foreground">ABC Trading Company</p>
                </div>
                <Badge variant="outline">2 hours ago</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Product listing pending approval</p>
                  <p className="text-sm text-muted-foreground">Electronics category</p>
                </div>
                <Badge variant="outline">4 hours ago</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Order completed successfully</p>
                  <p className="text-sm text-muted-foreground">Order #12345</p>
                </div>
                <Badge variant="outline">6 hours ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const AdminPanelWithAuth = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminPanel />
  </ProtectedRoute>
);

export default AdminPanelWithAuth;
