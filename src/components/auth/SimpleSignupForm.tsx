import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Phone, Briefcase, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { validatePakistaniPhone, normalizePakistaniPhone } from '@/lib/pakistani-phone-auth';
import { OTPVerification } from './OTPVerification';

// Step schemas
const businessTypeSchema = z.object({
  businessType: z.enum(['wholesaler', 'seller'])
});

const phoneSchema = z.object({
  phoneNumber: z.string()
    .min(1, "Phone number is required")
    .refine((val) => validatePakistaniPhone(val), {
      message: "Please enter a valid Pakistani phone number (03XX-XXXXXXX)"
    })
});

const passwordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
});

type BusinessTypeValues = z.infer<typeof businessTypeSchema>;
type PhoneValues = z.infer<typeof phoneSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

const SimpleSignupForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);

  // Form data stored across steps
  const [businessType, setBusinessType] = useState<'wholesaler' | 'seller' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const businessForm = useForm<BusinessTypeValues>({
    resolver: zodResolver(businessTypeSchema),
    defaultValues: { businessType: 'seller' }
  });

  const phoneForm = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: '' }
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '' }
  });

  // Check phone availability
  const checkPhoneAvailability = async (phone: string) => {
    if (!validatePakistaniPhone(phone)) {
      setPhoneAvailable(null);
      return;
    }

    try {
      const normalized = normalizePakistaniPhone(phone);
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('normalized_phone', normalized)
        .maybeSingle();

      if (error) throw error;
      setPhoneAvailable(!data);
    } catch (error) {
      console.error('Error checking phone:', error);
      setPhoneAvailable(null);
    }
  };

  // Step 1: Business Type Selection
  const handleBusinessTypeSubmit = async (data: BusinessTypeValues) => {
    setBusinessType(data.businessType);
    setCurrentStep(2);
  };

  // Step 2: Phone Number Entry
  const handlePhoneSubmit = async (data: PhoneValues) => {
    setIsLoading(true);
    try {
      const normalized = normalizePakistaniPhone(data.phoneNumber);
      
      // Send OTP
      const { data: otpData, error: otpError } = await supabase.functions.invoke('send-otp', {
        body: { phone: normalized, type: 'signup' },
      });

      if (otpError) throw otpError;
      if (!otpData?.success) throw new Error(otpData?.error || 'Failed to send OTP');

      setPhoneNumber(normalized);
      setCurrentStep(3);

      toast({
        title: 'OTP Sent!',
        description: 'Please check your phone for the verification code.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to send OTP',
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: OTP Verification
  const handleOTPVerified = () => {
    setIsPhoneVerified(true);
    setCurrentStep(4);
    toast({
      title: 'Phone Verified!',
      description: 'Now create your password.',
    });
  };

  // Step 4: Password Creation & Account Setup
  const handlePasswordSubmit = async (data: PasswordValues) => {
    setIsLoading(true);
    try {
      if (!businessType || !phoneNumber || !isPhoneVerified) {
        throw new Error('Missing required information. Please start over.');
      }

      // Create pseudo email from phone
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      const pseudoEmail = `phone-${digitsOnly}@pakbazaarconnect.store`;
      const redirectUrl = `${window.location.origin}/dashboard`;

      // Sign up with Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: pseudoEmail,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: businessType,
            phone: phoneNumber,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Try to sign in immediately
      if (!authData.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: pseudoEmail,
          password: data.password,
        });
        if (signInError) {
          console.warn('Auto sign-in failed:', signInError.message);
        }
      }

      toast({
        title: 'Account Created Successfully!',
        description: 'Welcome to Pak Bazaar Connect.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = (currentStep / 4) * 100;
  const selectedBusinessType = businessForm.watch('businessType');

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-lg overflow-hidden bg-card">
      <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground pb-6 pt-6">
        <div className="flex items-center justify-between mb-2">
          {currentStep > 1 && currentStep !== 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-primary-foreground hover:bg-primary-foreground/20 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <div className="flex-1" />
        </div>
        
        <div className="flex justify-center mb-3">
          <div className="bg-primary-foreground/10 p-3 rounded-full backdrop-blur-sm border border-primary-foreground/20">
            <Phone className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        
        <CardTitle className="text-2xl font-bold font-poppins text-primary-foreground text-center">
          Create Account
        </CardTitle>
        <CardDescription className="font-poppins text-primary-foreground/90 text-sm text-center mt-1">
          Step {currentStep} of 4
        </CardDescription>
        <Progress value={progressPercentage} className="h-1.5 mt-3" />
      </CardHeader>

      <CardContent className="pt-6">
        {/* Step 1: Business Type Selection */}
        {currentStep === 1 && (
          <Form {...businessForm}>
            <form onSubmit={businessForm.handleSubmit(handleBusinessTypeSubmit)} className="space-y-6">
              <FormField
                control={businessForm.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-foreground">
                      I want to join as a:
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={selectedBusinessType === 'seller' ? 'default' : 'outline'}
                          className={`h-28 flex flex-col items-center justify-center gap-2 ${
                            selectedBusinessType === 'seller'
                              ? 'bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white'
                              : 'hover:bg-pakistani_green-50'
                          }`}
                          onClick={() => field.onChange('seller')}
                        >
                          <Briefcase className="h-8 w-8" />
                          <span className="font-semibold text-sm">Seller/Retailer</span>
                          <span className="text-xs opacity-80">(خریدار)</span>
                        </Button>
                        <Button
                          type="button"
                          variant={selectedBusinessType === 'wholesaler' ? 'default' : 'outline'}
                          className={`h-28 flex flex-col items-center justify-center gap-2 ${
                            selectedBusinessType === 'wholesaler'
                              ? 'bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white'
                              : 'hover:bg-pakistani_green-50'
                          }`}
                          onClick={() => field.onChange('wholesaler')}
                        >
                          <Briefcase className="h-8 w-8" />
                          <span className="font-semibold text-sm">Wholesaler</span>
                          <span className="text-xs opacity-80">(تھوک فروش)</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white py-6">
                Continue
              </Button>
            </form>
          </Form>
        )}

        {/* Step 2: Phone Number Entry */}
        {currentStep === 2 && (
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Enter Your Phone Number</h3>
                <p className="text-sm text-muted-foreground">
                  We'll send you a verification code via SMS
                </p>
              </div>
              
              <FormField
                control={phoneForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
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
                          onChange={(e) => {
                            field.onChange(e);
                            checkPhoneAvailability(e.target.value);
                          }}
                        />
                        {phoneAvailable === true && (
                          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                        )}
                        {phoneAvailable === false && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 text-sm font-bold">✗</span>
                        )}
                      </div>
                    </FormControl>
                    {phoneAvailable === false && (
                      <p className="text-sm text-destructive font-medium">
                        This phone number is already registered
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white py-6"
                disabled={isLoading || phoneAvailable === false}
              >
                {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
              </Button>
            </form>
          </Form>
        )}

        {/* Step 3: OTP Verification */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <OTPVerification
              phoneNumber={phoneNumber}
              onVerified={handleOTPVerified}
              onBack={() => setCurrentStep(2)}
            />
          </div>
        )}

        {/* Step 4: Password Creation */}
        {currentStep === 4 && (
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-lg">Phone Verified!</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Now create a secure password for your account
                </p>
              </div>
              
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Password *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Create a strong password"
                        disabled={isLoading}
                        className="font-poppins"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Min 8 characters with uppercase, lowercase, and numbers
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white py-6"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
        )}

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-pakistani_green-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong>Secure Registration:</strong> Your phone number will be verified via OTP
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

export default SimpleSignupForm;
