
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Menu, X, LogOut, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  // If we're on an auth page, don't show the navbar
  if (isAuthPage) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <div className="bg-pakistani_green-700 rounded-xl p-2 shadow-md">
              <span className="text-white text-xl font-bold">PBC</span>
            </div>
            <span className="text-xl font-bold text-pakistani_green-800 ml-2 hidden md:inline-block">Pak Bazaar Connect</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-pakistani_green-700 font-medium">Home</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-pakistani_green-700 font-medium">Dashboard</Link>
                <div className="ml-4 flex items-center space-x-3">
                  <Link to="/profile">
                    <Button variant="outline" size="sm" className="flex items-center border-pakistani_green-700 text-pakistani_green-700">
                      <User className="mr-1 h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center text-gray-700"
                  >
                    <LogOut className="mr-1 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" className="border-pakistani_green-700 text-pakistani_green-700">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-pakistani_green-700 hover:bg-pakistani_green-800 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 px-2 space-y-3 border-t border-gray-200">
            <Link 
              to="/" 
              className="block py-2 px-4 rounded-md hover:bg-pakistani_green-50 text-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block py-2 px-4 rounded-md hover:bg-pakistani_green-50 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className="block py-2 px-4 rounded-md hover:bg-pakistani_green-50 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  className="w-full text-left py-2 px-4 rounded-md hover:bg-pakistani_green-50 text-gray-700"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block py-2 px-4 rounded-md hover:bg-pakistani_green-50 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block py-2 px-4 rounded-md hover:bg-pakistani_green-50 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
