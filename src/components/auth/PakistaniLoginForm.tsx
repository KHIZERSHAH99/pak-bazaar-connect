import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneInput } from '@/components/ui/phone-input';
import { Phone, Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authenticateUserWithCaptcha } from '@/lib/auth/consolidated';
import { validatePakistaniPhone, normalizePakistaniPhone } from '@/lib/auth/phone-utils';
import { authSecurityManager } from '@/lib/security/enhanced-auth-security';
import { showAuthError } from '@/lib/auth/auth-errors';
import { useLanguage } from '@/contexts/LanguageContext';

const PakistaniLoginForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState('');
  const { t, language } = useLanguage();
  const isRtl = language === 'ur';
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkLockout = async () => {
      if (phoneNumber && validatePakistaniPhone(normalizePakistaniPhone(phoneNumber))) {
        const lockoutStatus = await authSecurityManager.checkAccountLockout(normalizePakistaniPhone(phoneNumber));
        setAccountLocked(lockoutStatus.isLocked);
        setLockoutMessage(t('accountLocked').replace('{minutes}', String(Math.ceil(lockoutStatus.remainingTime / 60000))));
      } else {
        setAccountLocked(false);
        setLockoutMessage('');
      }
    };

    const timeoutId = setTimeout(checkLockout, 500);
    return () => clearTimeout(timeoutId);
  }, [phoneNumber, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      
      if (!validatePakistaniPhone(cleanPhone)) {
        throw new Error(t('validPhoneError'));
      }

      if (accountLocked) {
        throw new Error(lockoutMessage || 'Account is temporarily locked');
      }

      console.log('🔐 Attempting authentication:', cleanPhone);
      
      const result = await authenticateUserWithCaptcha(cleanPhone, password);
      
      if (result.user) {
        toast({
          title: t('welcomeBack'),
          description: t('loginSuccess'),
        });

        const redirectTo = searchParams.get('redirect') || '/dashboard';
        navigate(redirectTo, { replace: true });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      showAuthError(error, 'login');
      
      if (error.message?.includes('No account') || error.message?.includes('not found')) {
        setTimeout(() => {
          toast({
            title: t('needAccount'),
            description: t('needAccountDesc'),
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/signup')}
                className={isRtl ? 'mr-2' : 'ml-2'}
              >
                {t('signup')}
              </Button>
            ),
          });
        }, 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <CardHeader className="text-center bg-gradient-to-r from-primary to-primary/80 text-primary-foreground pb-8 pt-8">
        <div className="inline-flex items-center justify-center p-3 bg-primary-foreground/10 rounded-full mb-4 backdrop-blur-sm border border-primary-foreground/20">
          <Phone className="h-8 w-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-3xl font-bold text-primary-foreground font-poppins">
          {t('pakistaniLogin')}
        </CardTitle>
        <CardDescription className="font-poppins text-primary-foreground/90 text-base mt-2">
          {t('enterMobileAndPassword')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 bg-card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium font-poppins text-foreground">
              {t('pakistaniMobileLabel')}
            </Label>
            <PhoneInput
              value={phoneNumber}
              onChange={setPhoneNumber}
              disabled={isLoading}
              required
              showValidation
              autoFormat
              error={accountLocked ? lockoutMessage : undefined}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium font-poppins text-foreground">
              {t('password')}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t('enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || accountLocked}
                className="font-poppins pr-10 h-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 ${isRtl ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center hover:text-foreground transition-colors`}
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

          <div className="flex items-center justify-between text-sm">
            <Link
              to="/forgot-password"
              className="text-primary hover:text-primary/80 font-medium font-poppins transition-colors"
            >
              {t('forgotPassword')}
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-poppins h-11 font-medium shadow-lg hover:shadow-xl transition-all"
            disabled={isLoading || accountLocked}
          >
            {isLoading ? (
              <>
                <Loader2 className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'} animate-spin`} />
                {t('signingIn')}
              </>
            ) : (
              t('signIn')
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">{t('or')}</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground font-poppins">
            {t('dontHaveAccount')}{' '}
            <Link
              to="/signup"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              {t('createPakistaniAccount')}
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
                {t('secureAuth')}
              </p>
              <p className="text-xs text-muted-foreground font-poppins mt-0.5">
                {t('secureAuthDesc')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PakistaniLoginForm;
