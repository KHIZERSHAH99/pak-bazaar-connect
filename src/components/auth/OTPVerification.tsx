import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, RefreshCw, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerified: () => void;
  onBack?: () => void;
}

export function OTPVerification({ phoneNumber, onVerified, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all digits are entered
    if (newOtp.every(digit => digit) && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: phoneNumber, otp: code }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Phone number verified successfully!');
        onVerified();
      } else {
        toast.error(data.error || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Failed to verify OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: phoneNumber, type: 'signup' }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('New OTP sent successfully!');
        setResendTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Verify Your Phone</CardTitle>
        <CardDescription className="text-center">
          We've sent a 6-digit code to <strong>{phoneNumber}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <Input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-semibold"
              disabled={isVerifying}
            />
          ))}
        </div>

        <Button
          onClick={() => handleVerifyOTP()}
          disabled={isVerifying || otp.join('').length !== 6}
          className="w-full"
        >
          {isVerifying ? 'Verifying...' : 'Verify OTP'}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <button
            onClick={handleResendOTP}
            disabled={!canResend || isResending}
            className="text-primary hover:underline disabled:text-gray-400 disabled:no-underline flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
          </button>
          
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              Change number
            </button>
          )}
        </div>

        <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Security Note:</p>
              <p>Never share your OTP with anyone. We will never call you to ask for this code.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}