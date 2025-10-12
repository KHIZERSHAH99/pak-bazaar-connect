import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SimpleSignupForm from '@/components/auth/SimpleSignupForm';
import Layout from '@/components/Layout';

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
    <Layout title="Signup - Pak Bazaar Connect">
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <SimpleSignupForm />
        </div>
      </div>
    </Layout>
  );
};

export default Signup;