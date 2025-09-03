import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhoneInput } from '@/components/ui/phone-input';
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
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
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
      const signupResult = await phoneSignUp(cleanPhone, formData.password, formData.role, {
        contactName: formData.contactName,
        businessName: formData.businessName,
        businessType: formData.businessType,
        address: formData.address,
        city: formData.city,
        industry: formData.industry
      });
      if (signupResult.user) {
        toast({
          title: 'اکاؤنٹ بن گیا! Account Created!',
          description: 'Your Pakistani business account has been created successfully.'
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
  return <Card className="w-full max-w-md mx-auto shadow-xl border-0 overflow-hidden">
      <CardHeader className="text-center bg-gradient-to-r from-primary to-primary/80 text-primary-foreground pb-8 pt-8">
        <div className="inline-flex items-center justify-center p-3 bg-primary-foreground/10 rounded-full mb-4 backdrop-blur-sm border border-primary-foreground/20">
          <Phone className="h-8 w-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-3xl font-bold text-primary-foreground font-poppins">
          پاکستانی اکاؤنٹ
        </CardTitle>
        <CardDescription className="font-poppins text-primary-foreground/90 text-base mt-2">
          Create your Pakistani B2B business account
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 bg-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium font-poppins text-foreground">Business Type</Label>
            <Select value={formData.role} onValueChange={(value: 'seller' | 'wholesaler') => setFormData({
            ...formData,
            role: value
          })}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seller">Seller/Retailer (خریدار)</SelectItem>
                <SelectItem value="wholesaler">Wholesaler (تھوک فروش)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            
            <PhoneInput value={formData.phoneNumber} onChange={value => setFormData({
            ...formData,
            phoneNumber: value
          })} disabled={isLoading} required showValidation autoFormat className="w-full" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName" className="text-sm font-medium font-poppins text-foreground">
              Contact Person Name
            </Label>
            <Input id="contactName" type="text" placeholder="Your full name" value={formData.contactName} onChange={e => setFormData({
            ...formData,
            contactName: e.target.value
          })} disabled={isLoading} className="font-poppins h-11" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-sm font-medium font-poppins text-foreground">
              Business Name
            </Label>
            <Input id="businessName" type="text" placeholder="Your business name" value={formData.businessName} onChange={e => setFormData({
            ...formData,
            businessName: e.target.value
          })} disabled={isLoading} className="font-poppins h-11" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium font-poppins text-foreground">
              Password
            </Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a password" value={formData.password} onChange={e => setFormData({
              ...formData,
              password: e.target.value
            })} disabled={isLoading} className="font-poppins pr-10 h-11" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-foreground transition-colors" disabled={isLoading}>
                {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium font-poppins text-foreground">
              Confirm Password
            </Label>
            <div className="relative">
              <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={formData.confirmPassword} onChange={e => setFormData({
              ...formData,
              confirmPassword: e.target.value
            })} disabled={isLoading} className="font-poppins pr-10 h-11" required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-foreground transition-colors" disabled={isLoading}>
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-poppins h-11 font-medium shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
            {isLoading ? <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Account...
              </> : 'Create Account'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground font-poppins">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Security notice */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground font-poppins">
                Secure Registration
              </p>
              <p className="text-xs text-muted-foreground font-poppins mt-0.5">
                Pakistani phone-only authentication with end-to-end encryption
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default PakistaniSignupForm;