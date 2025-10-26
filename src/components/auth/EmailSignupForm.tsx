import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Phone, Briefcase, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { validatePakistaniPhone, normalizePakistaniPhone } from '@/lib/phone-utils';

// Signup form schema with email as primary
const signupSchema = z.object({
  businessType: z.enum(['wholesaler', 'seller']),
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

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { 
      businessType: 'seller',
      email: '',
      phoneNumber: '',
      password: ''
    }
  });

  const handleSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const normalizedPhone = normalizePakistaniPhone(data.phoneNumber);

      // Check for duplicate email/phone before signup
      const { data: existingProfiles, error: checkError } = await supabase
        .from('profiles')
        .select('id, email, normalized_phone')
        .or(`email.eq.${data.email},normalized_phone.eq.${normalizedPhone}`);

      if (checkError) {
        console.error('Error checking duplicates:', checkError);
      }

      if (existingProfiles && existingProfiles.length > 0) {
        const duplicate = existingProfiles[0];
        if (duplicate.email?.toLowerCase() === data.email.toLowerCase()) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        if (duplicate.normalized_phone === normalizedPhone) {
          throw new Error('An account with this phone number already exists. Please sign in instead.');
        }
      }

      // Sellers skip email confirmation, wholesalers need verification
      const skipEmailConfirmation = data.businessType === 'seller';

      // Sign up with Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: data.businessType,
            phone: normalizedPhone,
            business_name: '',
            contact_name: '',
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('Signup failed - no user data returned');
      }

      // Create/update profile with phone and email
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: data.email,
          phone_number: normalizedPhone,
          normalized_phone: normalizedPhone,
          role: data.businessType,
          email_verified: skipEmailConfirmation, // Sellers auto-verified
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      if (skipEmailConfirmation) {
        // Sellers: redirect to dashboard immediately
        toast({
          title: 'Account Created!',
          description: 'Welcome to Pak Bazaar Connect',
        });
        navigate('/dashboard');
      } else {
        // Wholesalers: send OTP and redirect to verification
        const { data: otpData } = await supabase.functions.invoke('send-otp-email', {
          body: { 
            userId: authData.user.id, 
            email: data.email,
            name: 'User'
          }
        });

        toast({
          title: 'Verification Code Sent!',
          description: `We've sent a 6-digit code to ${data.email}`,
        });

        navigate(`/verify-otp?userId=${authData.user.id}&email=${data.email}`);
      }
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

  const selectedBusinessType = form.watch('businessType');

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
                    <Input
                      {...field}
                      type="tel"
                      placeholder="03XX-XXXXXXX"
                      disabled={isLoading}
                      className="font-poppins"
                    />
                  </FormControl>
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
                    <Input
                      {...field}
                      type="password"
                      placeholder="Create a password"
                      disabled={isLoading}
                      className="font-poppins"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white py-6 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </Form>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-pakistani_green-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong>Secure Registration:</strong> Pakistani phone-only authentication with end-to-end encryption
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
