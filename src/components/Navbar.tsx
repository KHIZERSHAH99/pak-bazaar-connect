
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  Home, 
  LayoutDashboard,
  ChevronDown,
  Bell
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

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
    }
    
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${bgColor}`}>
        {profile.role}
      </span>
    );
  };

  return (
    <header className={`bg-white sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : 'border-b border-gray-200'}`}>
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
            <Link to="/" className="text-gray-700 hover:text-pakistani_green-700 font-medium flex items-center gap-1.5 transition-colors duration-200">
              <Home className="w-4 h-4" />
              Home
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-pakistani_green-700 font-medium flex items-center gap-1.5 transition-colors duration-200">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{profile?.email?.split('@')[0]}</span>
                      {getRoleBadge()}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
          <div className="md:hidden py-4 px-2 space-y-3 border-t border-gray-200 animate-in slide-in-from-top">
            <Link 
              to="/" 
              className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-pakistani_green-50 text-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-pakistani_green-50 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
                
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-pakistani_green-50 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Profile {getRoleBadge()}
                </Link>
                
                <button
                  className="w-full text-left flex items-center gap-2 py-2 px-4 rounded-md hover:bg-red-50 text-red-600"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-5 w-5" />
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
                  className="block py-2 px-4 rounded-md bg-pakistani_green-700 text-white"
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
