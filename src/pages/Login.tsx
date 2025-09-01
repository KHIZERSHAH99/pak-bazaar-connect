import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PakistaniLoginForm from '@/components/auth/PakistaniLoginForm';
import { TestLogin } from '@/components/auth/TestLogin';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Shield, Users, TrendingUp, Star, Package, ShoppingCart, Building } from 'lucide-react';

const Login: React.FC = () => {
  const [showDebug] = useState(false);

  // Check if we should show debug panel (only in development or for debugging)
  const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('lovable.app');

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

      <div className="relative z-10 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-poppins mb-2">
              Pak Bazaar Connect
            </h1>
            <p className="text-muted-foreground font-poppins text-lg">
              Pakistan's Trusted B2B Marketplace
            </p>
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          {isDev ? (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="font-poppins">Regular Login</TabsTrigger>
                <TabsTrigger value="test" className="font-poppins">Test Accounts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <PakistaniLoginForm />
              </TabsContent>
              
              <TabsContent value="test">
                <TestLogin />
              </TabsContent>
            </Tabs>
          ) : (
            <PakistaniLoginForm />
          )}

          {/* Features Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-card/80 backdrop-blur-sm p-4 rounded-lg border border-border/50 text-center">
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground font-poppins">Secure Platform</h3>
              <p className="text-xs text-muted-foreground mt-1 font-poppins">
                End-to-end encrypted transactions
              </p>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm p-4 rounded-lg border border-border/50 text-center">
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground font-poppins">10,000+ Businesses</h3>
              <p className="text-xs text-muted-foreground mt-1 font-poppins">
                Trusted by Pakistani traders
              </p>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm p-4 rounded-lg border border-border/50 text-center">
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground font-poppins">Grow Business</h3>
              <p className="text-xs text-muted-foreground mt-1 font-poppins">
                Expand your network nationwide
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
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
    </div>
  );
};

export default Login;