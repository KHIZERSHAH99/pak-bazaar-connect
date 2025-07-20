
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { enhancedSignOut } from '@/lib/enhanced-auth';
import { toast } from '@/hooks/use-toast';
import { 
  Menu, 
  X, 
  ShoppingBag, 
  Package, 
  LayoutDashboard,
  LogOut,
  User,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { data: session, isLoading } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleSignOut = async () => {
    try {
      await enhancedSignOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const user = session?.user;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 font-bold text-xl text-pakistani_green-600 dark:text-pakistani_green-400 font-poppins"
          >
            <ShoppingBag className="h-8 w-8" />
            <span>Pak Bazaar</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/products" 
              className={`text-gray-700 dark:text-gray-300 hover:text-pakistani_green-600 dark:hover:text-pakistani_green-400 font-poppins transition-colors ${
                isActive('/products') ? 'text-pakistani_green-600 dark:text-pakistani_green-400 font-semibold' : ''
              }`}
            >
              Products
            </Link>
            
            <Link 
              to="/chat" 
              className={`text-gray-700 dark:text-gray-300 hover:text-pakistani_green-600 dark:hover:text-pakistani_green-400 font-poppins transition-colors ${
                isActive('/chat') ? 'text-pakistani_green-600 dark:text-pakistani_green-400 font-semibold' : ''
              }`}
            >
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Support
            </Link>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Theme and Language toggles */}
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>

            {/* Auth section */}
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`font-poppins ${isActive('/dashboard') ? 'bg-pakistani_green-100 dark:bg-pakistani_green-900/30 text-pakistani_green-700 dark:text-pakistani_green-300' : ''}`}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.profile_image || ''} alt={profile?.contact_name || user.email || ''} />
                        <AvatarFallback className="bg-pakistani_green-100 dark:bg-pakistani_green-900 text-pakistani_green-700 dark:text-pakistani_green-300">
                          {(profile?.contact_name || user.email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm font-poppins">
                          {profile?.contact_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground font-poppins">
                          {user.email}
                        </p>
                        {profile?.role && (
                          <p className="text-xs text-pakistani_green-600 dark:text-pakistani_green-400 font-poppins capitalize">
                            {profile.role}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="font-poppins">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="font-poppins">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="font-poppins text-red-600 dark:text-red-400"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-poppins">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link 
              to="/products" 
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-pakistani_green-600 dark:hover:text-pakistani_green-400 font-poppins"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              to="/chat" 
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-pakistani_green-600 dark:hover:text-pakistani_green-400 font-poppins"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Support Chat
            </Link>
            
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-gray-700 dark:text-gray-300 font-poppins">Theme & Language</span>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
