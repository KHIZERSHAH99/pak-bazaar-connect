import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Phone, Briefcase, Lock, Mail, Eye, EyeOff, User, Building2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { validatePakistaniPhone, normalizePakistaniPhone } from '@/lib/phone-utils';
import { useLanguage } from '@/contexts/LanguageContext';

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
    .regex(/[0-9]/, "Must contain at least one number"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the Terms & Conditions to create an account"
  })
});

type SignupFormValues = z.infer<typeof signupSchema>;

const EmailSignupForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneCheckStatus, setPhoneCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [step, setStep] = useState<1 | 2>(1);
  const { t, language } = useLanguage();
  const isRtl = language === 'ur';

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { 
      businessType: 'seller',
      contactName: '',
      businessName: '',
      email: '',
      phoneNumber: '',
      password: '',
      acceptTerms: false
    }
  });

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

  const handleSubmit = async (formData: SignupFormValues) => {
    if (phoneCheckStatus === 'taken') {
      toast({
        variant: 'destructive',
        title: t('phoneAlreadyRegistered'),
        description: t('phoneAlreadyDesc'),
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const normalizedPhone = normalizePakistaniPhone(formData.phoneNumber);
      const redirectUrl = `${window.location.origin}/auth/callback`;

      // Friendly pre-check: tell users clearly when their email is already
      // registered, instead of the generic "check your email" response.
      // The RPC is rate-limited server-side to prevent enumeration.
      try {
        const { data: taken } = await supabase.rpc('email_is_taken', {
          p_email: formData.email,
        });
        if (taken === true) {
          toast({
            variant: 'destructive',
            title: t('emailAlreadyRegistered') || 'Email already registered',
            description:
              t('emailAlreadyDesc') ||
              'This email is already linked to an account. Try logging in or reset your password.',
          });
          setIsLoading(false);
          return;
        }
      } catch (preErr) {
        // Non-fatal — fall through and let signUp handle it.
        console.warn('email_is_taken pre-check failed, continuing:', preErr);
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: formData.businessType,
            phone: normalizedPhone,
            contact_name: formData.contactName,
            business_name: formData.businessName,
          },
        },
      });

      if (signUpError) throw signUpError;

      sessionStorage.setItem('pendingConfirmationEmail', formData.email);

      toast({
        title: t('accountCreated'),
        description: t('checkEmailConfirm'),
      });

      navigate('/email-confirmation-pending');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      toast({
        variant: 'destructive',
        title: t('signupFailed'),
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBusinessType = form.watch('businessType');
  const password = form.watch('password');
  
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

  const goToStep2 = async () => {
    const valid = await form.trigger(['businessType', 'contactName', 'phoneNumber']);
    if (!valid) return;
    if (phoneCheckStatus === 'taken') return;
    setStep(2);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-lg overflow-hidden bg-card" dir={isRtl ? 'rtl' : 'ltr'}>
      <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground pb-6 pt-8">
        <div className="flex justify-center mb-3">
          <div className="bg-primary-foreground/10 p-3 rounded-full backdrop-blur-sm border border-primary-foreground/20">
            <Phone className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        
        <CardTitle className="text-xl font-bold font-poppins text-center">
          {t('pakistaniAccount')}
        </CardTitle>
        <CardDescription className="font-poppins text-white/90 text-sm text-center mt-1">
          {t('createB2BAccount')}
        </CardDescription>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className={`h-2 w-10 rounded-full ${step === 1 ? 'bg-primary-foreground' : 'bg-primary-foreground/40'}`} />
          <div className={`h-2 w-10 rounded-full ${step === 2 ? 'bg-primary-foreground' : 'bg-primary-foreground/40'}`} />
        </div>
        <p className="text-center text-xs text-white/80 mt-1 font-poppins">
          {step === 1 ? 'Step 1 of 2 · قدم ۱ / ۲' : 'Step 2 of 2 · قدم ۲ / ۲'}
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {step === 1 && (<>
            {/* Business Type Selection */}
            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground">
                    {t('businessTypeLabel')} *
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={selectedBusinessType === 'seller' ? 'default' : 'outline'}
                       className={`h-20 flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform ${
                          selectedBusinessType === 'seller'
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                            : 'hover:bg-primary/5'
                        }`}
                        onClick={() => field.onChange('seller')}
                      >
                        <Briefcase className="h-6 w-6" />
                        <span className="font-semibold text-sm">{t('sellerTitle')}</span>
                      </Button>
                      <Button
                        type="button"
                        variant={selectedBusinessType === 'wholesaler' ? 'default' : 'outline'}
                        className={`h-20 flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform ${
                          selectedBusinessType === 'wholesaler'
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                            : 'hover:bg-primary/5'
                        }`}
                        onClick={() => field.onChange('wholesaler')}
                      >
                        <Briefcase className="h-6 w-6" />
                        <span className="font-semibold text-sm">{t('wholesalerTitle')}</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Name */}
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t('contactNameLabel')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('yourFullName')}
                      disabled={isLoading}
                      className="font-poppins h-12 md:h-11 text-base"
                      autoComplete="name"
                      autoCapitalize="words"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('pakistaniMobileLabel')} *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="tel"
                        placeholder="03XX-XXXXXXX"
                        disabled={isLoading}
                        className={`font-poppins h-12 md:h-11 text-base ${isRtl ? 'pl-12' : 'pr-12'}`}
                        autoComplete="tel-national"
                        inputMode="numeric"
                      />
                      <div className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`}>
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
                      {t('phoneTaken')} <Link to="/login" className="underline">{t('loginInstead')}</Link>
                    </p>
                  )}
                  {phoneCheckStatus === 'available' && (
                    <p className="text-sm text-green-600">{t('phoneAvailable')}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              onClick={goToStep2}
              className="w-full h-12 md:h-11 text-base font-semibold"
              disabled={isLoading || phoneCheckStatus === 'taken' || phoneCheckStatus === 'checking'}
            >
              Next · اگلا
            </Button>
            </>)}

            {step === 2 && (<>
            {/* Business Name */}
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {t('businessNameLabel')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('yourBusinessName')}
                      disabled={isLoading}
                      className="font-poppins h-12 md:h-11 text-base"
                      autoComplete="organization"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('emailAddress')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="your@email.com"
                      disabled={isLoading}
                      className="font-poppins h-12 md:h-11 text-base"
                      autoComplete="email"
                      inputMode="email"
                      autoCapitalize="none"
                      spellCheck={false}
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
                    {t('passwordLabel')} *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('createStrongPassword')}
                        disabled={isLoading}
                        className={`font-poppins h-12 md:h-11 text-base ${isRtl ? 'pl-12' : 'pr-12'}`}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors`}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
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
                        {passwordStrength <= 2 ? t('weakPassword') : passwordStrength <= 3 ? t('mediumPassword') : t('strongPassword')}
                      </p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms */}
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border border-border p-4 active:bg-muted/30 transition-colors">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      className="mt-0.5 h-5 w-5 rounded border-input accent-primary cursor-pointer"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-poppins cursor-pointer">
                      {t('agreeToTerms')}{' '}
                      <Link
                        to="/terms-and-conditions"
                        target="_blank"
                        className="text-primary hover:text-primary/80 underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('termsAndConditions')}
                      </Link>
                      {' '}{t('and')}{' '}
                      <Link
                        to="/privacy-policy"
                        target="_blank"
                        className="text-primary hover:text-primary/80 underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('privacyPolicy')}
                      </Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 md:h-11 text-base font-semibold active:scale-[0.99] transition-transform"
              disabled={isLoading || phoneCheckStatus === 'taken'}
            >
              {isLoading ? (
                <>
                  <Loader2 className={`${isRtl ? 'ml-2' : 'mr-2'} h-4 w-4 animate-spin`} />
                  {t('creatingAccount')}
                </>
              ) : (
                t('createAccount')
              )}
            </Button>
          </form>
        </Form>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong>{t('secureRegistration')}:</strong> {t('secureRegDesc')}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border bg-muted/30 dark:bg-muted/50 flex justify-center p-4">
        <p className="text-sm text-muted-foreground font-poppins">
          {t('alreadyHaveAccountLink')}{' '}
          <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
            {t('signInHere')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default EmailSignupForm;
