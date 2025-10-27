import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { normalizePakistaniPhone } from '@/lib/auth/phone-utils';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type AuthByPhoneResponse = {
  success: boolean;
  email?: string;
};

const EmailLoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const handleResendVerification = async () => {
    const identifier = form.getValues('identifier');
    
    // Check if it's an email
    const isEmail = identifier.includes('@');
    
    if (!isEmail) {
      toast({
        title: "Email verification only",
        description: "Phone verification resend is not supported yet",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: identifier,
      });

      if (error) throw error;

      toast({
        title: "Verification email sent!",
        description: "Please check your inbox and click the verification link",
      });
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: "Failed to resend email",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setEmailNotConfirmed(false);

    try {
      const identifier = values.identifier.trim();
      
      // Check if it's a phone number or email
      const isPhone = /^(\+92|92|0)?3\d{9}$/.test(identifier.replace(/\D/g, ''));
      
      if (isPhone) {
        // Normalize phone to 03XXXXXXXXX format
        let normalizedPhone = identifier.replace(/\D/g, '');
        if (normalizedPhone.startsWith('92')) {
          normalizedPhone = '0' + normalizedPhone.slice(2);
        } else if (!normalizedPhone.startsWith('0')) {
          normalizedPhone = '0' + normalizedPhone;
        }

        // Look up user by normalized phone
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('normalized_phone', normalizedPhone)
          .single();

        if (profileError || !profile) {
          throw new Error('No account found with this phone number');
        }

        // Sign in with the email we found
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: values.password,
        });

        if (signInError) {
          if (signInError.message.includes('Email not confirmed')) {
            setEmailNotConfirmed(true);
            toast({
              title: "Email not verified",
              description: "Please verify your email before logging in.",
              variant: "destructive",
            });
            return;
          }
          throw signInError;
        }
      } else {
        // Handle email login
        const { error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password: values.password,
        });

        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setEmailNotConfirmed(true);
            toast({
              title: "Email not verified",
              description: "Please verify your email before logging in.",
              variant: "destructive",
            });
            return;
          }
          throw error;
        }
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email/phone or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 border-primary/10 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-primary">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Login to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailNotConfirmed && (
            <Alert className="mb-4 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <p className="font-semibold mb-2">Please verify your email first</p>
                <p className="text-sm mb-3">
                  Check your inbox for the verification link. Didn't receive it?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  className="w-full border-orange-300 hover:bg-orange-100"
                >
                  Resend Verification Email
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email or Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email@example.com or 03001234567"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your password"
                        type="password"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailLoginForm;
