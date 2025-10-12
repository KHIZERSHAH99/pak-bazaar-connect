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
import { Phone, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { validatePakistaniPhone } from '@/lib/auth/phone-utils';

const signupSchema = z.object({
  phoneNumber: z.string()
    .min(1, "Phone number is required")
    .refine((val) => validatePakistaniPhone(val), {
      message: "Please enter a valid Pakistani phone number (03XX-XXXXXXX or +923XX-XXXXXXX)"
    }),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  businessType: z.enum(['wholesaler', 'seller'])
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SimpleSignupForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      phoneNumber: '',
      password: '',
      businessType: 'seller'
    }
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      // Normalize phone number
      let normalizedPhone = data.phoneNumber.trim().replace(/\s+/g, '');
      if (normalizedPhone.startsWith('0')) {
        normalizedPhone = '+92' + normalizedPhone.substring(1);
      } else if (!normalizedPhone.startsWith('+')) {
        normalizedPhone = '+92' + normalizedPhone;
      }

      // Sign up with Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        phone: normalizedPhone,
        password: data.password,
        options: {
          data: {
            role: data.businessType
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            phone: normalizedPhone,
            role: data.businessType,
            email: `${normalizedPhone}@placeholder.com`
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        toast({
          title: 'Account Created Successfully!',
          description: 'Welcome to Pak Bazaar Connect. Please complete your profile.',
        });

        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup Failed',
        description: error.message || 'An error occurred during signup',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBusinessType = form.watch('businessType');

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-lg overflow-hidden bg-card">
      <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground pb-8 pt-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary-foreground/10 p-3 rounded-full backdrop-blur-sm border border-primary-foreground/20">
            <Phone className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold font-poppins text-primary-foreground">
          پاکستانی اکاؤنٹ
        </CardTitle>
        <CardDescription className="font-poppins text-primary-foreground/90 text-base mt-2">
          Create your Pakistani B2B business account
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Business Type Selection */}
            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Business Type *</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={selectedBusinessType === 'seller' ? 'default' : 'outline'}
                        className={`h-auto py-4 ${
                          selectedBusinessType === 'seller'
                            ? 'bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white'
                            : 'hover:bg-pakistani_green-50'
                        }`}
                        onClick={() => field.onChange('seller')}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          <span className="font-medium">Seller/Retailer</span>
                          <span className="text-xs opacity-80">(خریدار)</span>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        variant={selectedBusinessType === 'wholesaler' ? 'default' : 'outline'}
                        className={`h-auto py-4 ${
                          selectedBusinessType === 'wholesaler'
                            ? 'bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white'
                            : 'hover:bg-pakistani_green-50'
                        }`}
                        onClick={() => field.onChange('wholesaler')}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          <span className="font-medium">Wholesaler</span>
                          <span className="text-xs opacity-80">(تھوک فروش)</span>
                        </div>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Pakistani Mobile Number *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
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
                  <FormLabel className="text-sm font-medium text-foreground">Password *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Create a password"
                      disabled={isLoading}
                      className="font-poppins"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins py-6 text-base"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-pakistani_green-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <strong>Secure Registration:</strong> Pakistani phone-only authentication with end-to-end encryption
                </p>
              </div>
            </div>
          </form>
        </Form>
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
