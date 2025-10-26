import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { verifyOTPCode, resendOTPCode } from '@/lib/auth/otp-verification';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const VerifyOTP: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const userId = searchParams.get('userId');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!userId || !email) {
      toast({
        variant: 'destructive',
        title: 'Invalid Link',
        description: 'Please sign up again to receive a verification code.'
      });
      navigate('/signup');
    }
  }, [userId, email, navigate, toast]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'Please enter the 6-digit verification code'
      });
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyOTPCode(userId!, otp);
      
      if (result.success) {
        toast({
          title: 'Email Verified!',
          description: 'Your email has been successfully verified.'
        });
        
        // Redirect to login after 1 second
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: result.error || 'Invalid or expired code'
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Verification failed'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      const result = await resendOTPCode(userId!, email!);
      
      if (result.success) {
        toast({
          title: 'Code Resent',
          description: 'A new verification code has been sent to your email'
        });
        setCountdown(60); // 60 second cooldown
        setOtp(''); // Clear the input
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Resend',
          description: result.error || 'Could not resend verification code'
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to resend code'
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Layout title="Verify Email - Pak Bazaar Connect">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to<br />
              <strong className="text-foreground">{email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isVerifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerify}
                disabled={otp.length !== 6 || isVerifying}
                className="w-full"
                size="lg"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify Email
                  </>
                )}
              </Button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={countdown > 0 || isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  'Resend Code'
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/signup')}
                className="text-sm"
              >
                Back to Signup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VerifyOTP;
