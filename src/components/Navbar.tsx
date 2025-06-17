
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Flag, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import EnhancedRoleSwitcher from './navbar/EnhancedRoleSwitcher';
import MobileMenu from './navbar/MobileMenu';

const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account'
      });
      navigate('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout failed',
        description: error.message || 'Failed to log out. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-pakistani_green-700 text-white py-2 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Flag className="w-40 h-40 text-white" />
        </div>
        <p className="font-medium text-sm md:text-base font-poppins relative z-10">
          Join Now! Free Ads for First 10 Wholesalers!
        </p>
      </div>

      {/* Main Navbar */}
      <header className="bg-white dark:bg-gray-950 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="bg-pakistani_green-700 rounded-xl p-2 shadow-md">
                <span className="text-white text-xl font-bold">PBC</span>
              </div>
              <span className="text-xl font-bold text-pakistani_green-800 dark:text-white hidden sm:inline font-poppins">
                Pak Bazaar Connect
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme and Language Controls */}
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <LanguageToggle />
              </div>

              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Role Switcher */}
                  {profile && (
                    <EnhancedRoleSwitcher />
                  )}

                  {/* Dashboard Link */}
                  <Link to="/dashboard">
                    <Button 
                      variant="ghost" 
                      className="text-pakistani_green-700 dark:text-pakistani_green-300 hover:text-pakistani_green-800 dark:hover:text-pakistani_green-200 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
                    >
                      Dashboard
                    </Button>
                  </Link>

                  {/* Logout Button */}
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-pakistani_green-700 text-pakistani_green-700 hover:bg-pakistani_green-700 hover:text-white dark:border-pakistani_green-300 dark:text-pakistani_green-300 dark:hover:bg-pakistani_green-700 dark:hover:text-white font-poppins transition-all duration-200"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <Button 
                      variant="ghost" 
                      className="text-pakistani_green-700 dark:text-pakistani_green-300 hover:text-pakistani_green-800 dark:hover:text-pakistani_green-200 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-pakistani_green-700 hover:bg-pakistani_green-800 text-white font-poppins shadow-md transition-all duration-200">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)}
          user={user}
          profile={profile}
          onLogout={handleLogout}
        />
      </header>
    </>
  );
};

export default Navbar;
