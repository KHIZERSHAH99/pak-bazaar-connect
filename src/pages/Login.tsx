
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import PhoneLoginForm from '@/components/auth/PhoneLoginForm';
import PakistaniLoginForm from '@/components/auth/PakistaniLoginForm';
import SignupForm from '@/components/auth/SignupForm';
import LoginDebugPanel from '@/components/auth/LoginDebugPanel';
import { Button } from '@/components/ui/button';

const Login: React.FC = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Check if we should show debug panel (only in development or for debugging)
  const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('lovable.app');

  return (
    <Layout>
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground font-poppins mb-2">
              {showSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground font-poppins">
              {showSignup 
                ? 'Sign up to start your business journey' 
                : 'Sign in to your account'
              }
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="px-4 py-8 sm:px-10">
            {showSignup ? <SignupForm /> : <PakistaniLoginForm />}
            
            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setShowSignup(!showSignup)}
                className="text-primary hover:text-primary/80 font-poppins"
              >
                {showSignup 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </Button>
            </div>

            {isDev && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowDebug(!showDebug)}
                  className="text-sm"
                >
                  {showDebug ? 'Hide Debug' : 'Show Debug Panel'}
                </Button>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-primary font-poppins"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
          
          {showDebug && isDev && (
            <div className="mt-8 px-4">
              <LoginDebugPanel />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Login;
