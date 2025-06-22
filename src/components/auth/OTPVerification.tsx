
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, Shield, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerified: (verified: boolean) => void;
  onPhoneChange?: (phone: string) => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  onVerified,
  onPhoneChange
}) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOTP = async () => {
    if (!phoneNumber.match(/^03\d{9}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Pakistani phone number (03XXXXXXXXX)",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // For now, we'll store the OTP in the database
      // In production, you would integrate with Twilio/MessageBird
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          otp_code: otpCode,
          otp_expires_at: expiresAt.toISOString(),
          otp_attempts: 0
        })
        .eq('id', user.id);

      if (error) throw error;

      // For demo purposes, show the OTP in console
      // In production, this would be sent via SMS
      console.log(`OTP for ${phoneNumber}: ${otpCode}`);
      
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}. Check console for demo OTP.`,
      });

      setTimeLeft(300); // 5 minutes
      setAttempts(0);
    } catch (error: any) {
      if (error.message.includes('profiles_phone_unique')) {
        toast({
          title: "Phone Number Already Registered",
          description: "This phone number is already associated with another account.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to Send OTP",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('otp_code, otp_expires_at, otp_attempts')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      if (!profile.otp_code) {
        throw new Error('No OTP found. Please request a new code.');
      }

      if (new Date() > new Date(profile.otp_expires_at)) {
        throw new Error('OTP has expired. Please request a new code.');
      }

      if (profile.otp_attempts >= 3) {
        throw new Error('Too many failed attempts. Please request a new code.');
      }

      if (otp !== profile.otp_code) {
        await supabase
          .from('profiles')
          .update({ otp_attempts: profile.otp_attempts + 1 })
          .eq('id', user.id);

        setAttempts(profile.otp_attempts + 1);
        throw new Error(`Invalid OTP. ${2 - profile.otp_attempts} attempts remaining.`);
      }

      // OTP verified successfully
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone_verified: true,
          phone_number: phoneNumber,
          otp_code: null,
          otp_expires_at: null,
          otp_attempts: 0
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Phone Verified Successfully",
        description: "Your phone number has been verified.",
      });

      onVerified(true);
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Smartphone className="h-5 w-5" />
          Phone Verification
        </CardTitle>
        <CardDescription>
          Verify your phone number to prevent duplicate accounts
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Phone verification helps us maintain platform security and prevent fake accounts.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneChange?.(e.target.value)}
            placeholder="03XXXXXXXXX"
            maxLength={11}
          />
        </div>

        <Button
          onClick={sendOTP}
          disabled={isSending || timeLeft > 0}
          className="w-full"
          variant="outline"
        >
          {isSending ? (
            'Sending OTP...'
          ) : timeLeft > 0 ? (
            <>
              <Clock className="h-4 w-4 mr-2" />
              Resend in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </>
          ) : (
            'Send Verification Code'
          )}
        </Button>

        {timeLeft > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>

            <Button
              onClick={verifyOTP}
              disabled={isVerifying || otp.length !== 6}
              className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700"
            >
              {isVerifying ? 'Verifying...' : 'Verify Phone Number'}
            </Button>

            {attempts > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  {attempts >= 3 ? 'Too many failed attempts. Please request a new code.' : 
                   `${3 - attempts} verification attempts remaining.`}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
