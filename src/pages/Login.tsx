
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import LoginHeader from '@/components/auth/LoginHeader';
import DemoAccounts from '@/components/auth/DemoAccounts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex flex-col">
      {/* Top Banner */}
      <div className="bg-pakistani_green-700 text-white py-2 px-4 text-center relative overflow-hidden">
        <p className="font-medium text-sm md:text-base">Join Now! Free Ads for First 10 Wholesalers!</p>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="bg-pakistani_green-700 rounded-xl p-2 shadow-md">
              <span className="text-white text-2xl font-bold">PBC</span>
            </div>
            <span className="ml-2 text-xl font-bold text-pakistani_green-800 hidden md:inline">
              Pak Bazaar Connect
            </span>
          </Link>
          
          <nav className="flex items-center space-x-2">
            <Link to="/signup">
              <Button variant="outline" size="sm" className="border-pakistani_green-700 text-pakistani_green-700 hover:bg-pakistani_green-50">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto flex-grow py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-lg overflow-hidden">
            <LoginHeader />
            <LoginForm />
          </Card>

          <DemoAccounts />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-pakistani_green-800 text-white py-4 px-6">
        <div className="container mx-auto text-center text-sm">
          <p>Build Successful, API Keys Secured</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
