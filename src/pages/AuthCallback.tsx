import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Handles email-verification + magic-link redirects from Supabase.
 *
 * Supabase appends either:
 *   ?code=...           (PKCE flow — exchange for a session)
 *   #access_token=...   (implicit flow — supabase-js auto-detects on load)
 *
 * On success we send the user to /dashboard with a friendly toast.
 * On failure we send them back to /login with the parsed error.
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'working' | 'ok' | 'error'>('working');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const errorDescription =
          url.searchParams.get('error_description') ||
          new URLSearchParams(url.hash.replace(/^#/, '')).get('error_description');

        if (errorDescription) {
          throw new Error(errorDescription);
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          // Implicit flow — supabase-js parses the hash automatically; just
          // give it a tick and check we have a session.
          await new Promise((r) => setTimeout(r, 200));
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            throw new Error('No verification code in the link. Please try again.');
          }
        }

        setStatus('ok');
        toast({
          title: 'Email verified',
          description: 'Welcome to PakMandi! Redirecting you to your dashboard…',
        });
        setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setErrorMessage(err?.message || 'Verification failed. Please try again.');
        setTimeout(
          () => navigate('/login', { replace: true, state: { fromCallback: true } }),
          2500,
        );
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-4">
        {status === 'working' && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <h1 className="text-xl font-semibold text-foreground font-poppins">
              Verifying your email…
            </h1>
            <p className="text-sm text-muted-foreground font-poppins">
              Just a moment while we sign you in.
            </p>
          </>
        )}
        {status === 'ok' && (
          <>
            <CheckCircle className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-xl font-semibold text-foreground font-poppins">
              You're verified!
            </h1>
            <p className="text-sm text-muted-foreground font-poppins">
              Taking you to your dashboard…
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-10 w-10 text-destructive mx-auto" />
            <h1 className="text-xl font-semibold text-foreground font-poppins">
              Verification failed
            </h1>
            <p className="text-sm text-muted-foreground font-poppins">{errorMessage}</p>
            <p className="text-xs text-muted-foreground font-poppins">
              Redirecting you to the login page…
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;