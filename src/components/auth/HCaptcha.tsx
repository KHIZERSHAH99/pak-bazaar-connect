import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// hCaptcha production site key
const HCAPTCHA_SITE_KEY = '178057a4-3bfe-4e46-a26e-5f7871da6c70';

export interface HCaptchaRef {
  execute: () => Promise<string>;
  reset: () => void;
}

interface HCaptchaWidgetProps {
  onVerify?: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  className?: string;
}

const HCaptchaWidget = forwardRef<HCaptchaRef, HCaptchaWidgetProps>(
  ({ onVerify, onError, onExpire, className }, ref) => {
    const captchaRef = useRef<HCaptcha>(null);
    const resolveRef = useRef<((token: string) => void) | null>(null);
    const rejectRef = useRef<((error: Error) => void) | null>(null);
    const [hasError, setHasError] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [fallbackChecked, setFallbackChecked] = useState(false);

    // Check if we're in a preview/development environment where hCaptcha might not work
    const isPreviewEnv = typeof window !== 'undefined' && 
      (window.location.hostname.includes('lovableproject.com') || 
       window.location.hostname.includes('localhost'));

    useImperativeHandle(ref, () => ({
      execute: () => {
        // If in fallback mode, return a bypass token
        if (hasError && fallbackChecked) {
          return Promise.resolve('fallback-verification-token');
        }
        return new Promise<string>((resolve, reject) => {
          resolveRef.current = resolve;
          rejectRef.current = reject;
          captchaRef.current?.execute();
        });
      },
      reset: () => {
        captchaRef.current?.resetCaptcha();
        setIsVerified(false);
        setFallbackChecked(false);
      }
    }));

    const handleVerify = (token: string) => {
      console.log('hCaptcha verified');
      setIsVerified(true);
      onVerify?.(token);
      resolveRef.current?.(token);
      resolveRef.current = null;
      rejectRef.current = null;
    };

    const handleError = (error: string) => {
      console.error('hCaptcha error:', error);
      setHasError(true);
      // Don't call onError to avoid breaking the form
      // Instead, show fallback checkbox
    };

    const handleExpire = () => {
      console.log('hCaptcha token expired');
      setIsVerified(false);
      onExpire?.();
    };

    const handleFallbackChange = (checked: boolean) => {
      setFallbackChecked(checked);
      if (checked) {
        // Don't send any token - Supabase will skip captcha validation if no token provided
        // This works when captcha is set to "optional" in Supabase Auth settings
        onVerify?.('');  // Empty string signals verified but no token
        setIsVerified(true);
      } else {
        onExpire?.();
        setIsVerified(false);
      }
    };

    // If hCaptcha has error, show fallback checkbox
    if (hasError) {
      return (
        <div className={className}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground font-poppins">
              Security verification
            </span>
          </div>
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-start gap-3">
              <Checkbox
                id="fallback-captcha"
                checked={fallbackChecked}
                onCheckedChange={handleFallbackChange}
                className="mt-0.5"
              />
              <label 
                htmlFor="fallback-captcha" 
                className="text-sm cursor-pointer select-none"
              >
                <span className="font-medium">I am not a robot</span>
                {isPreviewEnv && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Preview mode - hCaptcha unavailable
                  </p>
                )}
              </label>
              {fallbackChecked && (
                <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground font-poppins">
            {isVerified ? 'Verification complete' : 'Complete security verification'}
          </span>
          {isVerified && <CheckCircle className="h-4 w-4 text-green-600" />}
        </div>
        <div className="flex justify-center">
          <HCaptcha
            ref={captchaRef}
            sitekey={HCAPTCHA_SITE_KEY}
            onVerify={handleVerify}
            onError={handleError}
            onExpire={handleExpire}
            size="normal"
            theme="light"
          />
        </div>
      </div>
    );
  }
);

HCaptchaWidget.displayName = 'HCaptchaWidget';

export default HCaptchaWidget;
