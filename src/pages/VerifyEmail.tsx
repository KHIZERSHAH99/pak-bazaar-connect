import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token_hash from URL
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        if (!tokenHash || type !== 'email') {
          setStatus('error');
          setMessage('Invalid verification link');
          return;
        }

        // Verify the email using Supabase's verifyOtp method
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email'
        });

        if (error) {
          throw error;
        }

        setStatus('success');
        setMessage('Email verified successfully! Redirecting to login...');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Verification failed. The link may have expired.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <Layout title="Verify Email - Pak Bazaar Connect">
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {status === 'verifying' && (
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="h-16 w-16 text-green-600" />
              )}
              {status === 'error' && (
                <XCircle className="h-16 w-16 text-destructive" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {status === 'verifying' && 'Verifying Email'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {message}
            </CardDescription>
          </CardHeader>
          
          {status === 'error' && (
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                The verification link may have expired or already been used.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="flex-1"
                >
                  Go to Login
                </Button>
                <Button
                  onClick={() => navigate('/signup')}
                  className="flex-1 bg-pakistani_green-600 hover:bg-pakistani_green-700"
                >
                  Sign Up Again
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default VerifyEmail;
