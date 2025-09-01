import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedSignupForm from '@/components/auth/EnhancedSignupForm';
import { Flag, ArrowLeft, Shield, Users, TrendingUp, Package, ShoppingCart, Building, Rocket, CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Floating Icons Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 text-primary/10 animate-pulse">
          <Package className="w-16 h-16" />
        </div>
        <div className="absolute top-40 right-32 text-primary/10 animate-pulse animation-delay-200">
          <ShoppingCart className="w-12 h-12" />
        </div>
        <div className="absolute bottom-32 left-32 text-primary/10 animate-pulse animation-delay-400">
          <Building className="w-14 h-14" />
        </div>
        <div className="absolute bottom-20 right-20 text-primary/10 animate-pulse animation-delay-600">
          <Users className="w-12 h-12" />
        </div>
      </div>

      {/* Top Banner */}
      <div className="relative z-10 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-3 px-4 text-center overflow-hidden shadow-lg">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <Flag className="w-40 h-40 text-primary-foreground" />
        </div>
        <p className="font-semibold text-sm md:text-base font-poppins relative z-10 flex items-center justify-center gap-2">
          <Rocket className="w-5 h-5" />
          Join Now! Free Ads for First 10 Wholesalers!
          <Rocket className="w-5 h-5" />
        </p>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-sm shadow-sm py-4 px-6 border-b border-border/50">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center group">
              <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-2 shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-primary-foreground text-2xl font-bold">PBC</span>
              </div>
              <span className="ml-2 text-xl font-bold text-foreground hidden md:inline font-poppins">
                Pak Bazaar Connect
              </span>
            </Link>
            
            <nav className="flex items-center space-x-2">
              <Link to="/login">
                <button className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-md text-sm font-medium font-poppins transition-all duration-200">
                  Login
                </button>
              </Link>
            </nav>
          </div>
        </header>

        <div className="container mx-auto py-8 md:py-12 px-4">
          {/* Main Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-poppins">
              Join Pakistan's Leading B2B Marketplace
            </h1>
            <p className="text-muted-foreground mt-3 font-poppins text-base md:text-lg max-w-2xl mx-auto">
              Connect with trusted buyers and suppliers across Pakistan
            </p>
          </div>
          
          <EnhancedSignupForm />
          
          {/* Benefits Section */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2 font-poppins">
                      Verified Business Network
                    </h3>
                    <p className="text-sm text-muted-foreground font-poppins">
                      All businesses are verified to ensure a safe and reliable platform for B2B trade.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2 font-poppins">
                      Grow Your Business
                    </h3>
                    <p className="text-sm text-muted-foreground font-poppins">
                      Access thousands of verified Pakistani businesses and expand your reach nationwide.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">10,000+</div>
                  <div className="text-sm text-muted-foreground font-poppins">Active Businesses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">50,000+</div>
                  <div className="text-sm text-muted-foreground font-poppins">Products Listed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">100+</div>
                  <div className="text-sm text-muted-foreground font-poppins">Cities Covered</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-12 text-center space-y-4">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary font-poppins transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link>
              <span>•</span>
              <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms</Link>
              <span>•</span>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-4 px-6 mt-auto">
        <div className="container mx-auto text-center text-sm font-poppins">
          <p>© 2024 Pak Bazaar Connect. Trusted marketplace with secure API infrastructure.</p>
        </div>
      </footer>
    </div>
  );
};

export default Signup;