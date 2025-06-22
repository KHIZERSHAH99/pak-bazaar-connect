
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import LoginForm from '@/components/auth/LoginForm';
import LoginHeader from '@/components/auth/LoginHeader';
import { Card } from '@/components/ui/card';
import { Flag } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      {/* Top Banner */}
      <div className="bg-pakistani_green-700 text-white py-2 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Flag className="w-40 h-40 text-white" />
        </div>
        <p className="font-medium text-sm md:text-base font-poppins">Join Now! Free Ads for First 10 Wholesalers!</p>
      </div>

      {/* Header */}
      <header className="bg-white dark:bg-gray-950 shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="bg-pakistani_green-700 rounded-xl p-2 shadow-md">
              <span className="text-white text-2xl font-bold">PBC</span>
            </div>
            <span className="ml-2 text-xl font-bold text-pakistani_green-800 dark:text-white hidden md:inline font-poppins">
              Pak Bazaar Connect
            </span>
          </Link>
          
          <nav className="flex items-center space-x-2">
            <Link to="/signup">
              <button className="border border-pakistani_green-700 text-pakistani_green-700 hover:bg-pakistani_green-50 dark:text-pakistani_green-200 dark:border-pakistani_green-300 dark:hover:bg-gray-900 px-4 py-2 rounded-md text-sm font-medium font-poppins transition-colors">
                Sign Up
              </button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto flex-grow py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-lg overflow-hidden bg-card dark:bg-gray-900">
            <LoginHeader />
            <LoginForm />
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-pakistani_green-800 dark:bg-gray-950 text-white py-4 px-6">
        <div className="container mx-auto text-center text-sm font-poppins">
          <p>© 2024 Pak Bazaar Connect. Trusted marketplace with secure API infrastructure.</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
