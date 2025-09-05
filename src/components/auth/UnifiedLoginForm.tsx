import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { unifiedSignIn } from '@/lib/auth/unified-auth';
import { detectInputType } from '@/lib/auth/input-detector';

export function UnifiedLoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputType, setInputType] = useState<'email' | 'phone' | 'unknown'>('unknown');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    
    // Detect input type for icon display
    const validation = detectInputType(value);
    if (validation.type === 'email') {
      setInputType('email');
    } else if (validation.type === 'phone') {
      setInputType('phone');
    } else {
      setInputType('unknown');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your email/phone and password',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await unifiedSignIn(identifier, password);
      
      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message || 'Invalid credentials',
          variant: 'destructive'
        });
        return;
      }
      
      toast({
        title: 'Success!',
        description: 'Welcome back!'
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md p-8 bg-background/95 backdrop-blur">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">
            Sign in with your email or phone number
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or Phone Number</Label>
            <div className="relative">
              <Input
                id="identifier"
                type="text"
                placeholder="email@example.com or 03XX-XXXXXXX"
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                autoComplete="username"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {inputType === 'email' ? (
                  <Mail className="h-4 w-4" />
                ) : inputType === 'phone' ? (
                  <Phone className="h-4 w-4" />
                ) : (
                  <div className="flex space-x-1">
                    <Mail className="h-3 w-3" />
                    <Phone className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your email address or Pakistani phone number
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
        
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <a
            href="/signup"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </a>
        </div>
      </div>
    </Card>
  );
}