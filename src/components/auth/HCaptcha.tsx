import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Shield, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// hCaptcha production site key
const HCAPTCHA_SITE_KEY = '178057a4-3bfe-4e46-a26e-5f7871da6c70';

export interface HCaptchaRef {
  execute: () => Promise<string>;
  reset: () => void;
  isPreviewMode: () => boolean;
}

interface HCaptchaWidgetProps {
  onVerify?: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  className?: string;
}

// Check if we're in a preview/development environment where hCaptcha might not work
const isPreviewEnvironment = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return (
    hostname.includes('lovableproject.com') ||
    hostname.includes('lovable.app') ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    hostname.includes('preview')
  );
};

const HCaptchaWidget = forwardRef<HCaptchaRef, HCaptchaWidgetProps>(
  ({ onVerify, onError, onExpire, className }, ref) => {
    const captchaRef = useRef<HCaptcha>(null);
    const resolveRef = useRef<((token: string) => void) | null>(null);
    const rejectRef = useRef<((error: Error) => void) | null>(null);
    const [hasError, setHasError] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [fallbackChecked, setFallbackChecked] = useState(false);
    
    const isPreview = isPreviewEnvironment();

    // Auto-verify in preview mode on mount
    useEffect(() => {
      if (isPreview && !isVerified) {
        // Small delay to simulate user action
        const timer = setTimeout(() => {
          // In preview mode, auto-set as verified with special marker
          setIsVerified(true);
          setFallbackChecked(true);
          onVerify?.('PREVIEW_MODE_BYPASS');
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [isPreview, isVerified, onVerify]);

    useImperativeHandle(ref, () => ({
      execute: () => {
        // If in preview/fallback mode, return bypass token
        if (isPreview || (hasError && fallbackChecked)) {
          return Promise.resolve('PREVIEW_MODE_BYPASS');
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
        if (!isPreview) {
          setFallbackChecked(false);
        }
      },
      isPreviewMode: () => isPreview
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
      // In preview mode or on error, enable fallback
    };

    const handleExpire = () => {
      console.log('hCaptcha token expired');
      if (!isPreview) {
        setIsVerified(false);
        onExpire?.();
      }
    };

    const handleFallbackChange = (checked: boolean) => {
      setFallbackChecked(checked);
      if (checked) {
        onVerify?.('FALLBACK_VERIFIED');
        setIsVerified(true);
      } else {
        onExpire?.();
        setIsVerified(false);
      }
    };

    // Preview environment - show auto-verified state
    if (isPreview) {
      return (
        <div className={className}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground font-poppins">
              Security verification
            </span>
          </div>
          <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Verification bypassed (Preview Mode)
                </p>
                <p className="text-xs text-green-600/70 dark:text-green-500/70 flex items-center gap-1 mt-1">
                  <Info className="h-3 w-3" />
                  hCaptcha is disabled in preview environments
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

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
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Fallback verification mode
                </p>
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
