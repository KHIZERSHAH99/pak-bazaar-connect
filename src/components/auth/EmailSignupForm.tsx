import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Phone, Briefcase, Lock, Mail, Eye, EyeOff, User, Building2, CheckCircle2, XCircle, Loader2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { validatePakistaniPhone, normalizePakistaniPhone } from '@/lib/phone-utils';
import HCaptchaWidget, { HCaptchaRef } from './HCaptcha';

// Enhanced signup form schema with business info
const signupSchema = z.object({
  businessType: z.enum(['wholesaler', 'seller']),
  contactName: z.string()
    .min(2, "Contact name must be at least 2 characters")
    .max(100, "Contact name must be less than 100 characters"),
  businessName: z.string()
    .min(2, "Business name must be at least 2 characters")
    .max(200, "Business name must be less than 200 characters"),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string()
    .min(1, "Phone number is required")
    .refine((val) => validatePakistaniPhone(val), {
      message: "Please enter a valid Pakistani phone number (03XX-XXXXXXX)"
    }),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
});

type SignupFormValues = z.infer<typeof signupSchema>;

const EmailSignupForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptchaRef>(null);
  
  // Phone validation state
  const [phoneCheckStatus, setPhoneCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { 
      businessType: 'seller',
      contactName: '',
      businessName: '',
      email: '',
      phoneNumber: '',
      password: ''
    }
  });

  // Watch phone number for real-time validation
  const phoneNumber = form.watch('phoneNumber');
  
  useEffect(() => {
    const checkPhone = async () => {
      if (!phoneNumber || !validatePakistaniPhone(phoneNumber)) {
        setPhoneCheckStatus('idle');
        return;
      }
      
      setPhoneCheckStatus('checking');
      
      try {
        const normalizedPhone = normalizePakistaniPhone(phoneNumber);
        
        // Check if phone exists using RPC function
        const { data: phoneData, error } = await supabase.rpc('check_phone_exists', {
          p_phone: normalizedPhone
        });
        
        if (error) {
          console.error('Phone check error:', error);
          setPhoneCheckStatus('idle');
          return;
        }
        
        setPhoneCheckStatus(phoneData ? 'taken' : 'available');
      } catch (err) {
        console.error('Phone validation error:', err);
        setPhoneCheckStatus('idle');
      }
    };
    
    const timer = setTimeout(checkPhone, 500);
    return () => clearTimeout(timer);
  }, [phoneNumber]);

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
  };

  const handleSubmit = async (formData: SignupFormValues) => {
    // Check if captcha is completed (including preview mode bypass)
    const isPreviewBypass = captchaToken === 'PREVIEW_MODE_BYPASS' || captchaToken === 'FALLBACK_VERIFIED';
    
    if (!captchaToken) {
      toast({
        variant: 'destructive',
        title: 'Security Verification Required',
        description: 'Please complete the captcha verification first.',
      });
      return;
    }
    
    // Check if phone is already taken
    if (phoneCheckStatus === 'taken') {
      toast({
        variant: 'destructive',
        title: 'Phone Already Registered',
        description: 'This phone number is already registered. Please login instead.',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const normalizedPhone = normalizePakistaniPhone(formData.phoneNumber);
      const redirectUrl = `${window.location.origin}/dashboard`;

      // Only include captchaToken if it's a real hCaptcha token (not preview/fallback bypass)
      const signupOptions: any = {
        emailRedirectTo: redirectUrl,
        data: {
          role: formData.businessType,
          phone: normalizedPhone,
          contact_name: formData.contactName,
          business_name: formData.businessName,
        },
      };
      
      // Add captcha token only if not in preview/bypass mode
      if (!isPreviewBypass) {
        signupOptions.captchaToken = captchaToken;
      }

      // Sign up with Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: signupOptions,
      });

      if (signUpError) throw signUpError;

      // Store email for confirmation page
      sessionStorage.setItem('pendingConfirmationEmail', formData.email);

      toast({
        title: 'Account Created!',
        description: 'Please check your email to confirm your account.',
      });

      // Redirect to email confirmation page
      navigate('/email-confirmation-pending');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Reset captcha on error
      captchaRef.current?.reset();
      setCaptchaToken(null);
      
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBusinessType = form.watch('businessType');
  const password = form.watch('password');
  
  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };
  
  const passwordStrength = getPasswordStrength(password || '');

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-lg overflow-hidden bg-card">
      <CardHeader className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 text-white pb-6 pt-8">
        <div className="flex justify-center mb-3">
          <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm border border-white/20">
            <Phone className="h-6 w-6 text-white" />
          </div>
        </div>
        
        <CardTitle className="text-xl font-bold font-poppins text-center" dir="rtl">
          پاکستانی اکاؤنٹ
        </CardTitle>
        <CardDescription className="font-poppins text-white/90 text-sm text-center mt-1">
          Create your Pakistani B2B business account
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Business Type Selection */}
            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground">
                    Business Type *
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={selectedBusinessType === 'seller' ? 'default' : 'outline'}
                        className={`h-20 flex flex-col items-center justify-center gap-1 ${
                          selectedBusinessType === 'seller'
                            ? 'bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white'
                            : 'hover:bg-pakistani_green-50'
                        }`}
                        onClick={() => field.onChange('seller')}
                      >
                        <Briefcase className="h-6 w-6" />
                        <span className="font-semibold text-sm">Seller/Retailer</span>
                      </Button>
                      <Button
                        type="button"
                        variant={selectedBusinessType === 'wholesaler' ? 'default' : 'outline'}
                        className={`h-20 flex flex-col items-center justify-center gap-1 ${
                          selectedBusinessType === 'wholesaler'
                            ? 'bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white'
                            : 'hover:bg-pakistani_green-50'
                        }`}
                        onClick={() => field.onChange('wholesaler')}
                      >
                        <Briefcase className="h-6 w-6" />
                        <span className="font-semibold text-sm">Wholesaler</span>
                        <span className="text-xs opacity-80">(تھوک فروش)</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Name Field */}
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Your full name"
                      disabled={isLoading}
                      className="font-poppins"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Business Name Field */}
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Business Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Your business or shop name"
                      disabled={isLoading}
                      className="font-poppins"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="your@email.com"
                      disabled={isLoading}
                      className="font-poppins"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pakistani Mobile Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Pakistani Mobile Number *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="tel"
                        placeholder="03XX-XXXXXXX"
                        disabled={isLoading}
                        className="font-poppins pr-10"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {phoneCheckStatus === 'checking' && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {phoneCheckStatus === 'available' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {phoneCheckStatus === 'taken' && (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>
                  </FormControl>
                  {phoneCheckStatus === 'taken' && (
                    <p className="text-sm text-destructive">
                      This phone number is already registered. <Link to="/login" className="underline">Login instead?</Link>
                    </p>
                  )}
                  {phoneCheckStatus === 'available' && (
                    <p className="text-sm text-green-600">Phone number is available!</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        disabled={isLoading}
                        className="font-poppins pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  {/* Password strength indicator */}
                  {password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              passwordStrength >= level
                                ? passwordStrength <= 2
                                  ? 'bg-destructive'
                                  : passwordStrength <= 3
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {passwordStrength <= 2 ? 'Weak password' : passwordStrength <= 3 ? 'Medium strength' : 'Strong password'}
                      </p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* hCaptcha Widget */}
            <div className="py-2">
              <HCaptchaWidget
                ref={captchaRef}
                onVerify={handleCaptchaVerify}
                onExpire={handleCaptchaExpire}
              />
              {captchaToken && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Security verification complete</span>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white py-6 font-semibold"
              disabled={isLoading || !captchaToken || phoneCheckStatus === 'taken'}
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
        </Form>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-pakistani_green-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong>Secure Registration:</strong> Your data is protected with industry-standard encryption and verified with hCaptcha.
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border bg-muted/30 dark:bg-muted/50 flex justify-center p-4">
        <p className="text-sm text-muted-foreground font-poppins">
          Already have an account?{' '}
          <Link to="/login" className="text-pakistani_green-600 dark:text-pakistani_green-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-100 font-medium">
            Sign in here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default EmailSignupForm;
