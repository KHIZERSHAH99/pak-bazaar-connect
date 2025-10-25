import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

const EmailConfirmationPending: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get email and role from session storage if available
    const storedEmail = sessionStorage.getItem('pendingConfirmationEmail');
    const storedRole = sessionStorage.getItem('pendingRole');
    if (storedEmail) {
      setEmail(storedEmail);
    }
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "No email found",
        description: "Please go back and sign up again",
        variant: "destructive",
      });
      return;
    }

    try {
      setResending(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) throw error;

      toast({
        title: "Email sent!",
        description: "Check your inbox for the verification link",
      });
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: "Failed to resend email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <Layout title="Verify Your Email - Pak Bazaar Connect">
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pakistani_green-500 to-pakistani_green-600 rounded-full flex items-center justify-center shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-base">
                We've sent a verification link to your email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {email && (
                <div className="p-4 bg-gradient-to-r from-pakistani_green-50 to-green-50 dark:from-pakistani_green-950/20 dark:to-green-950/20 rounded-lg border border-pakistani_green-200 dark:border-pakistani_green-800">
                  <p className="text-sm text-muted-foreground text-center">Email sent to:</p>
                  <p className="font-semibold text-foreground text-center mt-1">{email}</p>
                  {role && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Account type: <span className="font-medium capitalize">{role}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pakistani_green-600 text-white flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-sm text-foreground pt-0.5">
                    Open the email from <strong>Pak Bazaar Connect</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pakistani_green-600 text-white flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-sm text-foreground pt-0.5">
                    Click <strong>"Verify Email Address"</strong> button
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pakistani_green-600 text-white flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-sm text-foreground pt-0.5">
                    You'll be verified instantly and can sign in
                  </p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-800 dark:text-green-200">
                    <strong>Simple & Secure:</strong> No confusing redirects - you stay on Pak Bazaar Connect throughout the process
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  <span dir="rtl" className="font-urdu">ای میل نہیں ملی؟</span>
                  <br />
                  Didn't receive the email?
                </p>
                <Button
                  onClick={handleResendEmail}
                  disabled={resending || !email}
                  variant="outline"
                  className="w-full hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-950/20"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending...' : 'Resend Confirmation Email'}
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <Link to="/login" className="w-full">
                  <Button className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700">
                    Already verified? Sign in
                  </Button>
                </Link>
              </div>

              <Link to="/" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-pakistani_green-600 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EmailConfirmationPending;
