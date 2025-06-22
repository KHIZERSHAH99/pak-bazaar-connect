
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, User, ShoppingBag, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const demoAccounts = [
  {
    role: 'Admin',
    email: 'admin@test.com',
    password: 'admin123',
    icon: Shield,
    color: 'bg-red-100 text-red-800',
    iconColor: 'text-red-600'
  },
  {
    role: 'Wholesaler',
    email: 'wholesaler1@test.com',
    password: 'wholesaler123',
    icon: ShoppingBag,
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600'
  },
  {
    role: 'Seller',
    email: 'seller1@test.com',
    password: 'seller123',
    icon: User,
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600'
  }
];

export const DemoAccountInfo: React.FC = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard.`,
    });
  };

  return (
    <div className="space-y-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Demo Accounts</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Use these accounts to test different user roles
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoAccounts.map((account, index) => {
              const IconComponent = account.icon;
              return (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 ${account.iconColor}`} />
                    <Badge className={account.color}>
                      {account.role}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Email:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(account.email, 'Email')}
                        className="h-auto p-1"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground break-all">
                      {account.email}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Password:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(account.password, 'Password')}
                        className="h-auto p-1"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.password}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
