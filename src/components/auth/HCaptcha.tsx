import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Shield } from 'lucide-react';

// hCaptcha site key from Supabase configuration
const HCAPTCHA_SITE_KEY = '10000000-ffff-ffff-ffff-000000000001';

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

    useImperativeHandle(ref, () => ({
      execute: () => {
        return new Promise<string>((resolve, reject) => {
          resolveRef.current = resolve;
          rejectRef.current = reject;
          captchaRef.current?.execute();
        });
      },
      reset: () => {
        captchaRef.current?.resetCaptcha();
      }
    }));

    const handleVerify = (token: string) => {
      console.log('hCaptcha verified');
      onVerify?.(token);
      resolveRef.current?.(token);
      resolveRef.current = null;
      rejectRef.current = null;
    };

    const handleError = (error: string) => {
      console.error('hCaptcha error:', error);
      onError?.(error);
      rejectRef.current?.(new Error(error));
      resolveRef.current = null;
      rejectRef.current = null;
    };

    const handleExpire = () => {
      console.log('hCaptcha token expired');
      onExpire?.();
    };

    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground font-poppins">
            Security verification
          </span>
        </div>
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
    );
  }
);

HCaptchaWidget.displayName = 'HCaptchaWidget';

export default HCaptchaWidget;
