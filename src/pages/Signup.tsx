import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SimpleSignupForm from '@/components/auth/SimpleSignupForm';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SimpleSignupForm />
      </div>
    </div>
  );
};

export default Signup;