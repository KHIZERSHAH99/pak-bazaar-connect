import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PakistaniLoginForm from '@/components/auth/PakistaniLoginForm';
import Layout from '@/components/Layout';

const FixedLogin: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout title="Login - Pak Bazaar Connect">
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <PakistaniLoginForm />
        </div>
      </div>
    </Layout>
  );
};

export default FixedLogin;
