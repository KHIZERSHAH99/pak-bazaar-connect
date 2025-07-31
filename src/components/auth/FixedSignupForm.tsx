
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Lock, Eye, EyeOff, Loader2, User, Building, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { enhancedSignUp } from '@/lib/auth-enhanced';
import { validateSignupForm } from '@/lib/security/form-validation';
import { rateLimiter, RATE_LIMITS, getClientIdentifier } from '@/lib/security/rateLimit';
import { validatePasswordStrength } from '@/lib/security/password-validation';

const FixedSignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
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
      // Client-side rate limiting check
      const clientId = getClientIdentifier();
      const rateCheck = await rateLimiter.checkRateLimit(
        `signup_${clientId}`, 
        RATE_LIMITS.SIGNUP.maxRequests, 
        RATE_LIMITS.SIGNUP.windowMs
      );

      if (!rateCheck.allowed) {
        const waitMinutes = Math.ceil((rateCheck.resetTime - Date.now()) / 60000);
        throw new Error(`Too many signup attempts (${rateCheck.remaining} remaining). Please wait ${waitMinutes} minutes before trying again. This security measure prevents automated account creation.`);
      }

      // Enhanced password strength validation
      const passwordStrength = validatePasswordStrength(formData.password);
      if (!passwordStrength.isValid) {
        throw new Error(passwordStrength.errors[0] || 'Password does not meet security requirements');
      }

      // Comprehensive form validation
      const validation = await validateSignupForm({
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        contactName: formData.contactName,
        businessName: formData.businessName,
        role: formData.role,
        address: formData.address,
        city: formData.city,
        industry: formData.industry,
        businessType: formData.businessType
      });

      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).flat();
        throw new Error(errorMessages[0] || 'Invalid input provided');
      }

      const cleanPhone = formData.phoneNumber.replace(/[^0-9]/g, '');
      const tempEmail = `${cleanPhone}@temp-phone-auth.com`;
      
      // Use sanitized data for signup
      await enhancedSignUp(
        tempEmail,
        formData.password,
        validation.sanitizedData!.role,
        {
          phoneNumber: validation.sanitizedData!.phoneNumber,
          contactName: validation.sanitizedData!.contactName,
          businessName: validation.sanitizedData!.businessName,
          businessType: formData.businessType,
          address: validation.sanitizedData!.address,
          city: validation.sanitizedData!.city,
          industry: validation.sanitizedData!.industry
        }
      );

      toast({
        title: 'Account Created!',
        description: 'Your secure account has been created successfully.',
      });

      // Force full page reload for security
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this phone number already exists. Please sign in instead.';
      } else if (error.message?.includes('Password') || error.message?.includes('security')) {
        errorMessage = error.message;
      } else if (error.message?.includes('rate limit') || error.message?.includes('attempts')) {
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

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center mb-2">
            <Shield className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800 font-poppins">Security & Limits</span>
          </div>
          <ul className="text-xs text-blue-700 font-poppins space-y-1">
            <li>• Password: 8+ chars, uppercase, lowercase, numbers</li>
            <li>• Rate limit: 5 signups per hour (prevents spam)</li>
            <li>• Phone validation ensures Pakistani numbers only</li>
            <li>• All business data is encrypted and secured</li>
          </ul>
        </div>

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
