
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import PhoneLoginForm from '@/components/auth/PhoneLoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { Button } from '@/components/ui/button';

const Login: React.FC = () => {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins mb-2">
              {showSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 font-poppins">
              {showSignup 
                ? 'Sign up to start your business journey' 
                : 'Sign in to your account'
              }
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="px-4 py-8 sm:px-10">
            {showSignup ? <SignupForm /> : <PhoneLoginForm />}
            
            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setShowSignup(!showSignup)}
                className="text-pakistani_green-600 hover:text-pakistani_green-700 font-poppins"
              >
                {showSignup 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </Button>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-pakistani_green-600 font-poppins"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
