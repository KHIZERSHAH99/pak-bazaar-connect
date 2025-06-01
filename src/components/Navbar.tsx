
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Menu, X, Home, LayoutDashboard } from 'lucide-react';
import UserMenu from './navbar/UserMenu';
import MobileMenu from './navbar/MobileMenu';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  // Track scroll position to add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
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

  // Helper to get role badge
  const getRoleBadge = () => {
    if (!profile) return null;
    
    let bgColor = "bg-gray-100 text-gray-800";
    
    if (profile.role === "admin") {
      bgColor = "bg-blue-100 text-blue-800";
    } else if (profile.role === "wholesaler") {
      bgColor = "bg-green-100 text-green-800";
    } else if (profile.role === "seller") {
      bgColor = "bg-purple-100 text-purple-800";
    } else if (profile.role === "pending") {
      bgColor = "bg-yellow-100 text-yellow-800";
    }
    
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-poppins ${bgColor}`}>
        {profile.role}
      </span>
    );
  };

  return (
    <header className={`bg-white sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : 'border-b border-gray-200'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 md:h-16">
          <Link to="/" className="flex items-center">
            <div className="bg-pakistani_green-700 rounded-xl p-2 shadow-md">
              <span className="text-white text-lg md:text-xl font-bold font-poppins">PBC</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-pakistani_green-800 ml-2 hidden sm:inline-block font-poppins">Pak Bazaar Connect</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link to="/" className="text-gray-700 hover:text-pakistani_green-700 font-medium flex items-center gap-1.5 transition-colors duration-200 font-poppins">
              <Home className="w-4 h-4" />
              Home
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-pakistani_green-700 font-medium flex items-center gap-1.5 transition-colors duration-200 font-poppins">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                
                <UserMenu
                  email={profile?.email}
                  role={profile?.role}
                  onLogout={handleLogout}
                  getRoleBadge={getRoleBadge}
                />
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" className="border-pakistani_green-700 text-pakistani_green-700 font-poppins">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-pakistani_green-700 hover:bg-pakistani_green-800 text-white font-poppins">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu
          isOpen={isMenuOpen}
          user={user}
          onItemClick={() => setIsMenuOpen(false)}
          onLogout={handleLogout}
          getRoleBadge={getRoleBadge}
        />
      </div>
    </header>
  );
};

export default Navbar;
