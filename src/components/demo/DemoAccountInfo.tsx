
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, User, ShoppingBag, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const demoAccounts = [
  {
    role: 'Admin',
    email: 'khizerfight@gmail.com',
    password: 'Use your actual password',
    icon: Shield,
    color: 'bg-red-100 text-red-800',
    iconColor: 'text-red-600',
    note: 'This is the actual admin account'
  },
  {
    role: 'Wholesaler (Demo)',
    email: 'wholesaler1@test.com',
    password: 'wholesaler123',
    icon: ShoppingBag,
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600',
    note: 'Create this account via signup'
  },
  {
    role: 'Seller (Demo)',
    email: 'seller1@test.com',
    password: 'seller123',
    icon: User,
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600',
    note: 'Create this account via signup'
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
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-700">
          <strong>Important:</strong> The demo accounts need to be created first via the signup process. Only the admin account (khizerfight@gmail.com) already exists.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Test Accounts</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Use these accounts to test different user roles
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoAccounts.map((account, index) => {
              const IconComponent = account.icon;
              const isExisting = account.email === 'khizerfight@gmail.com';
              
              return (
                <div key={index} className={`border rounded-lg p-4 space-y-3 ${isExisting ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 ${account.iconColor}`} />
                    <Badge className={account.color}>
                      {account.role}
                    </Badge>
                    {isExisting && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Exists
                      </Badge>
                    )}
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
                      {account.password !== 'Use your actual password' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account.password, 'Password')}
                          className="h-auto p-1"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.password}
                    </p>

                    <p className="text-xs text-gray-500 italic">
                      {account.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to Test:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. <strong>Admin:</strong> Login with khizerfight@gmail.com (use your actual password)</li>
              <li>2. <strong>Demo Users:</strong> First signup with wholesaler1@test.com or seller1@test.com</li>
              <li>3. Choose the appropriate role during signup</li>
              <li>4. Then login with the created credentials</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
