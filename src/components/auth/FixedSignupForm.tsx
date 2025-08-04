
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Lock, Eye, EyeOff, Loader2, User, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { enhancedSignUp } from '@/lib/auth-enhanced';
import { supabase } from '@/integrations/supabase/client';

const FixedSignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'seller' as 'seller' | 'wholesaler',
    contactName: '',
    businessName: '',
    businessType: '',
    address: '',
    city: '',
    industry: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔄 Starting signup process with data:', {
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        contactName: formData.contactName,
        businessName: formData.businessName,
        role: formData.role
      });

      if (!formData.email || !formData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      const cleanPhone = formData.phoneNumber.replace(/[^0-9]/g, '');
      console.log('📞 Cleaned phone number:', cleanPhone);
      
      if (cleanPhone.length < 10) {
        throw new Error('Please enter a valid phone number');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Enhanced password validation
      const passwordValidation = await import('@/lib/security/password-validation').then(m => m.validatePasswordStrength(formData.password));
      if (!passwordValidation.isValid) {
        throw new Error(`Password security requirements not met: ${passwordValidation.errors.join(', ')}`);
      }

      // Check for existing email/phone before creating account
      console.log('🔍 Checking for existing users...');
      const { data: existingCheck, error: checkError } = await supabase.rpc('check_user_exists', {
        p_email: formData.email,
        p_phone: formData.phoneNumber
      });

      if (checkError) {
        console.error('Error checking existing users:', checkError);
        throw new Error('Unable to verify account uniqueness. Please try again.');
      }

      // Type-safe check for existing users
      const checkResult = existingCheck as { email_exists: boolean; phone_exists: boolean } | null;
      
      if (checkResult?.email_exists) {
        throw new Error('An account with this email address already exists. Please use a different email or sign in instead.');
      }

      if (checkResult?.phone_exists) {
        throw new Error('An account with this phone number already exists. Please use a different phone number or sign in instead.');
      }

      console.log('📧 Using email:', formData.email);
      
      console.log('🚀 Calling enhancedSignUp...');
      await enhancedSignUp(
        formData.email,
        formData.password,
        formData.role,
        {
          phoneNumber: formData.phoneNumber,
          contactName: formData.contactName,
          businessName: formData.businessName,
          businessType: formData.businessType,
          address: formData.address,
          city: formData.city,
          industry: formData.industry
        }
      );

      console.log('✅ Signup successful!');
      toast({
        title: 'Account Created!',
        description: 'Your account has been created successfully.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this phone number already exists. Please sign in instead.';
      } else if (error.message?.includes('Password')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Signup Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary font-poppins">
          Create Account
        </CardTitle>
        <CardDescription className="font-poppins">
          Join Pakistan's Premier B2B Marketplace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role" className="font-poppins">Account Type</Label>
            <Select value={formData.role} onValueChange={(value: 'seller' | 'wholesaler') => setFormData({...formData, role: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seller">Seller (Buy Products)</SelectItem>
                <SelectItem value="wholesaler">Wholesaler (Sell Products)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center font-poppins">
              <User className="h-4 w-4 mr-2 text-primary" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={isLoading}
              className="font-poppins"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName" className="flex items-center font-poppins">
              <User className="h-4 w-4 mr-2 text-primary" />
              Contact Person Name
            </Label>
            <Input
              id="contactName"
              type="text"
              placeholder="Your full name"
              value={formData.contactName}
              onChange={(e) => setFormData({...formData, contactName: e.target.value})}
              disabled={isLoading}
              className="font-poppins"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName" className="flex items-center font-poppins">
              <Building className="h-4 w-4 mr-2 text-primary" />
              Business Name
            </Label>
            <Input
              id="businessName"
              type="text"
              placeholder="Your business name"
              value={formData.businessName}
              onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              disabled={isLoading}
              className="font-poppins"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center font-poppins">
              <Phone className="h-4 w-4 mr-2 text-primary" />
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="03XX XXXXXXX"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              disabled={isLoading}
              className="font-poppins"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center font-poppins">
              <Lock className="h-4 w-4 mr-2 text-primary" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                disabled={isLoading}
                className="font-poppins pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center font-poppins">
              <Lock className="h-4 w-4 mr-2 text-primary" />
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                disabled={isLoading}
                className="font-poppins pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 font-poppins"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground font-poppins">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-primary hover:text-primary/90 font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FixedSignupForm;
