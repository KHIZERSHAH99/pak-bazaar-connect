
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextFixed';
import FixedLoginForm from '@/components/auth/FixedLoginForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FixedLogin: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pakistani_green-700"></div>
      </div>
    );
  }

  // Redirect to dashboard if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <FixedLoginForm />
      </main>
      <Footer />
    </div>
  );
};

export default FixedLogin;
