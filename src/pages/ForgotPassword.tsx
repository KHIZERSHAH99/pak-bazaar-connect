import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;

      setSent(true);
      toast({
        title: 'Reset link sent',
        description: 'Check your email for a password reset link',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset link',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center bg-gradient-to-r from-primary to-primary/80 text-primary-foreground pb-8 pt-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary-foreground/10 rounded-full mb-4 backdrop-blur-sm border border-primary-foreground/20">
            <Mail className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary-foreground font-poppins">
            Reset Password
          </CardTitle>
          <p className="text-primary-foreground/90 text-sm font-poppins mt-2">
            Enter your email to receive a password reset link
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle className="h-16 w-16 text-primary mx-auto" />
              <h3 className="text-lg font-semibold text-foreground font-poppins">Check your email</h3>
              <p className="text-muted-foreground font-poppins text-sm">
                We've sent a password reset link to <strong>{email}</strong>. 
                Click the link in the email to reset your password.
              </p>
              <Button
                variant="outline"
                onClick={() => setSent(false)}
                className="font-poppins"
              >
                Send again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium font-poppins text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="font-poppins h-11"
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-poppins h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary font-poppins transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
