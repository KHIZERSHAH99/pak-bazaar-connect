import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { authenticateUser } from '@/lib/auth/consolidated';
import { Lock } from 'lucide-react';

interface TestAccount {
  phone: string;
  password: string;
  role: string;
  description: string;
}

const testAccounts: TestAccount[] = [
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
    phone: '03331234567',
    password: 'test123',
    role: 'wholesaler',
    description: 'Test Wholesale Company 2'
  }
];

export const TestLogin = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTestLogin = async (account: TestAccount) => {
    setLoading(account.phone);
    try {
      console.log('Testing login with:', account.phone);
      const result = await authenticateUser(account.phone, account.password);
      
      if (result.user) {
        toast({
          title: "Login Successful!",
          description: `Logged in as ${account.role}`,
        });
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error: any) {
      console.error('Test login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Failed to login with test account",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Test Accounts
        </CardTitle>
        <CardDescription>
          Quick login with test accounts for development
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {testAccounts.map((account) => (
          <div
            key={account.phone}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{account.phone}</span>
                <Badge variant="outline" className="text-xs">
                  {account.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {account.description}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleTestLogin(account)}
              disabled={loading === account.phone}
            >
              {loading === account.phone ? "Logging in..." : "Login"}
            </Button>
          </div>
        ))}
        <p className="text-xs text-muted-foreground text-center pt-2">
          All test accounts use password: <code className="px-1 py-0.5 bg-muted rounded">test123</code>
        </p>
      </CardContent>
    </Card>
  );
};