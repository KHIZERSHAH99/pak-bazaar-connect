import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, Lock, Eye, EyeOff, Loader2, User, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { unifiedSignUp } from '@/lib/auth/unified-auth';
import { detectInputType, validateEmail, validatePakistaniPhone } from '@/lib/auth/input-detector';
import { UserRole } from '@/types/auth';

export function UnifiedSignupForm() {
  const [signupType, setSignupType] = useState<'email' | 'phone'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('seller');
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const validateInput = (): boolean => {
    if (!identifier || !password || !confirmPassword) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return false;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return false;
    }
    
    if (password.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive'
      });
      return false;
    }
    
    if (signupType === 'email' && !validateEmail(identifier)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return false;
    }
    
    if (signupType === 'phone' && !validatePakistaniPhone(identifier)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid Pakistani phone number (03XX-XXXXXXX)',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!contactName) {
      toast({
        title: 'Missing Name',
        description: 'Please enter your name',
        variant: 'destructive'
      });
      return false;
    }
    
    if (role === 'wholesaler' && !businessName) {
      toast({
        title: 'Missing Business Name',
        description: 'Business name is required for wholesalers',
        variant: 'destructive'
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInput()) return;
    
    setIsLoading(true);
    
    try {
      const additionalData = {
        contact_name: contactName,
        business_name: businessName || null,
        business_type: role
      };
      
      const { data, error } = await unifiedSignUp(identifier, password, role, additionalData);
      
      if (error) {
        toast({
          title: 'Registration Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      toast({
        title: 'Account Created!',
        description: 'Please check your email to verify your account',
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
          <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
          <p className="text-muted-foreground mt-2">
            Join Pakistan's leading B2B marketplace
          </p>
        </div>
        
        <Tabs value={signupType} onValueChange={(v) => setSignupType(v as 'email' | 'phone')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phone">
              <Phone className="mr-2 h-4 w-4" />
              Phone
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="phone" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your Pakistani mobile number without country code
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactName">Your Name</Label>
            <div className="relative">
              <Input
                id="contactName"
                type="text"
                placeholder="Enter your full name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Account Type</Label>
            <RadioGroup value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="seller" id="seller" />
                <Label htmlFor="seller" className="cursor-pointer">
                  I want to buy products (Seller/Retailer)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wholesaler" id="wholesaler" />
                <Label htmlFor="wholesaler" className="cursor-pointer">
                  I want to sell products (Wholesaler)
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {role === 'wholesaler' && (
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <div className="relative">
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Enter your business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading}
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
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
        
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <a
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </a>
        </div>
      </div>
    </Card>
  );
}