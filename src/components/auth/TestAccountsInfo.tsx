import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

const TestAccountsInfo: React.FC = () => {
  const testAccounts = [
    {
      phone: '03001234567',
      password: 'test123',
      role: 'wholesaler',
      description: 'Test Wholesale Business'
    },
    {
      phone: '03121234567',
      password: 'test123',
      role: 'seller',
      description: 'Test Retail Store'
    },
    {
      phone: '03418837167',
      password: 'test123',
      role: 'wholesaler',
      description: 'Existing Wholesaler Account'
    }
  ];

  return (
    <Card className="w-full max-w-md mx-auto mt-4 border-muted">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Test Accounts Available</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Use these accounts for testing authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {testAccounts.map((account, index) => (
          <div key={index} className="p-2 bg-muted/50 rounded-md space-y-1">
            <div className="flex items-center justify-between">
              <code className="text-xs font-mono">{account.phone}</code>
              <Badge variant="outline" className="text-xs">
                {account.role}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Password: <code className="font-mono">test123</code>
            </div>
            <div className="text-xs text-muted-foreground">
              {account.description}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TestAccountsInfo;