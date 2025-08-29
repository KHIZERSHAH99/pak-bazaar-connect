import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Lock, Eye, EyeOff, Loader2, User, Building, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { phoneSignUp, validatePakistaniPhone, normalizePakistaniPhone } from '@/lib/pakistani-phone-auth';
import { showAuthError, validatePasswordStrength, validateAuthForm } from '@/lib/auth/auth-errors';

const PakistaniSignupForm: React.FC = () => {
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    
    // Auto-format Pakistani phone number
    if (value.length <= 11) {
      if (value.startsWith('03')) {
        const formatted = value.length > 4 ? 
          `${value.substring(0, 4)}-${value.substring(4)}` : 
          value;
        setFormData({...formData, phoneNumber: formatted});
      } else {
        setFormData({...formData, phoneNumber: value});
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanPhone = formData.phoneNumber.replace(/[^0-9]/g, '');
      
      // Validate form fields
      const errors = validateAuthForm({
        phone: cleanPhone,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      
      if (errors.length > 0) {
        // Show the first error
        const firstError = errors[0];
        showAuthError(firstError, 'signup');
        setIsLoading(false);
        return;
      }

      // Additional validation for required fields
      if (!formData.contactName) {
        throw new Error('Contact person name is required');
      }
      
      if (!formData.businessName) {
        throw new Error('Business name is required');
      }

      // Create account directly without OTP
      console.log('🚀 Creating account without OTP...');
      const signupResult = await phoneSignUp(
        cleanPhone,
        formData.password,
        formData.role,
        {
          contactName: formData.contactName,
          businessName: formData.businessName,
          businessType: formData.businessType,
          address: formData.address,
          city: formData.city,
          industry: formData.industry
        }
      );

      if (signupResult.user) {
        toast({
          title: 'اکاؤنٹ بن گیا! Account Created!',
          description: 'Your Pakistani business account has been created successfully.',
        });

        // Navigate to dashboard
        navigate('/dashboard');
      }

    } catch (error: any) {
      console.error('Signup error:', error);
      showAuthError(error, 'signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary font-poppins flex items-center justify-center gap-2">
          <Phone className="h-6 w-6" />
          پاکستانی اکاؤنٹ
        </CardTitle>
        <CardDescription className="font-poppins">
          Create your Pakistani B2B business account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role" className="font-poppins">Business Type</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: 'seller' | 'wholesaler') => 
                setFormData({...formData, role: value})
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seller">Seller/Retailer (خریدار)</SelectItem>
                <SelectItem value="wholesaler">Wholesaler (تھوک فروش)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center font-poppins">
              <Phone className="h-4 w-4 mr-2 text-primary" />
              Pakistani Mobile Number
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="03XX-XXXXXXX"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              disabled={isLoading}
              className="font-poppins"
              maxLength={12}
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
                Processing...
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

        {/* Security notice */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span className="font-poppins">
              Secure Pakistani phone-only authentication
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PakistaniSignupForm;