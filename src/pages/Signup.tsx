
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextFixed';
import EnhancedSignupForm from '@/components/auth/EnhancedSignupForm';
import { Flag } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex flex-col">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Flag className="w-40 h-40 text-primary-foreground" />
        </div>
        <p className="font-medium text-sm md:text-base font-poppins">Join Now! Free Ads for First 10 Wholesalers!</p>
      </div>

      {/* Header */}
      <header className="bg-background shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="bg-primary rounded-xl p-2 shadow-md">
              <span className="text-primary-foreground text-2xl font-bold">PBC</span>
            </div>
            <span className="ml-2 text-xl font-bold text-foreground hidden md:inline font-poppins">
              Pak Bazaar Connect
            </span>
          </Link>
          
          <nav className="flex items-center space-x-2">
            <Link to="/login">
              <button className="border border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-md text-sm font-medium font-poppins transition-colors">
                Login
              </button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto flex-grow py-8 md:py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-poppins">Join Pakistan's Leading B2B Marketplace</h1>
          <p className="text-muted-foreground mt-2 font-poppins text-sm md:text-base">Connect with trusted buyers and suppliers across Pakistan</p>
        </div>
        
        <EnhancedSignupForm />
        
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-card p-4 md:p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-card-foreground mb-2 flex items-center font-poppins">
              <div className="w-4 h-4 bg-primary rounded-full mr-2"></div>
              Trusted by Businesses Across Pakistan
            </h3>
            <p className="text-sm md:text-base text-muted-foreground font-poppins">
              Pak Bazaar Connect verifies all businesses to ensure a safe and reliable platform. 
              Join thousands of verified Pakistani businesses already growing their reach.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-4 px-6">
        <div className="container mx-auto text-center text-sm font-poppins">
          <p>© 2024 Pak Bazaar Connect. Trusted marketplace with secure API infrastructure.</p>
        </div>
      </footer>
    </div>
  );
};

export default Signup;
