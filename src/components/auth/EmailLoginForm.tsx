import React, { useState, useRef } from 'react';
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
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { normalizePakistaniPhone } from '@/lib/auth/phone-utils';
import HCaptchaWidget, { HCaptchaRef } from './HCaptcha';

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
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptchaRef>(null);

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
    // Require captcha to be completed before submission (token can be empty string for fallback)
    if (captchaToken === null) {
      toast({
        title: "Security verification required",
        description: "Please complete the captcha verification first",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      setEmailNotConfirmed(false);
      
      const { identifier, password } = values;
      
      // Determine if identifier is email or phone
      const isEmail = identifier.includes('@');
      
      console.log('Attempting login with:', identifier, 'Type:', isEmail ? 'email' : 'phone');

      let data, error;
      
      // Only include captchaToken if it's a real token (not empty fallback)
      const authOptions = captchaToken ? { captchaToken } : undefined;

      if (isEmail) {
        // Login with email
        const result = await supabase.auth.signInWithPassword({
          email: identifier,
          password: password,
          options: authOptions,
        });
        data = result.data;
        error = result.error;
      } else {
        // Normalize phone number using shared utility
        const normalizedPhone = normalizePakistaniPhone(identifier);
        console.log('Normalized phone:', normalizedPhone);
        
        // Authenticate by phone via secure RPC (bypasses RLS safely)
        const { data: authDataRaw, error: rpcError } = await supabase.rpc('authenticate_user_by_phone', {
          user_phone: normalizedPhone,
        });
        const authData = authDataRaw as AuthByPhoneResponse;
        
        if (rpcError || !authData || authData.success !== true || !authData.email) {
          throw new Error('Phone number not found. Please check and try again.');
        }
        
        const result = await supabase.auth.signInWithPassword({
          email: authData.email,
          password: password,
          options: authOptions,
        });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Login error:', error);
        
        // Reset captcha on error
        captchaRef.current?.reset();
        setCaptchaToken(null);
        
        // Check if it's an email not confirmed error
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setEmailNotConfirmed(true);
          return;
        }
        
        throw error;
      }

      console.log('Login successful:', data);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Reset captcha on error
      captchaRef.current?.reset();
      setCaptchaToken(null);
      
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
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
                      <div className="relative">
                        <Input
                          placeholder="Enter your password"
                          type={showPassword ? 'text' : 'password'}
                          {...field}
                          disabled={loading}
                          className="pr-10"
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* hCaptcha Widget */}
              <HCaptchaWidget
                ref={captchaRef}
                onVerify={handleCaptchaVerify}
                onExpire={handleCaptchaExpire}
                className="flex flex-col items-center my-4"
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
