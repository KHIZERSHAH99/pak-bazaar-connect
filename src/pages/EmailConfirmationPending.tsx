import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

const EmailConfirmationPending: React.FC = () => {
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get email from session storage if available
    const storedEmail = sessionStorage.getItem('pendingConfirmationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
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
          <Card className="border-2 border-primary/10 shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-base">
                We've sent a verification link to your email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {email && (
                <div className="p-4 bg-primary/5 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Email sent to:</p>
                  <p className="font-semibold text-primary">{email}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">English Instructions:</p>
                    <p className="text-muted-foreground">
                      Click the verification link in the email to activate your account. 
                      Check your spam folder if you don't see it.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg" dir="rtl">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">اردو ہدایات:</p>
                    <p className="text-muted-foreground">
                      اپنے اکاؤنٹ کو فعال کرنے کے لیے ای میل میں تصدیقی لنک پر کلک کریں۔ 
                      اگر آپ کو نہیں ملتا تو اپنا سپام فولڈر چیک کریں۔
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  disabled={resending || !email}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending...' : "Didn't receive email? Resend"}
                </Button>

                <Link to="/login" className="block">
                  <Button variant="default" className="w-full bg-primary hover:bg-primary/90">
                    Already verified? Login here
                  </Button>
                </Link>
              </div>

              <div className="text-center text-sm text-muted-foreground space-y-1">
                <p>Need help?</p>
                <Link to="/" className="text-primary hover:underline">
                  Return to homepage
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EmailConfirmationPending;
