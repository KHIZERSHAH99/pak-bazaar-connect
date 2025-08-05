import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextFixed';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Flag, Menu, X, ShoppingBag, Users, Zap, Package, BookOpen } from 'lucide-react';
import UserMenu from './navbar/UserMenu';
import MobileMenu from './navbar/MobileMenu';
const Navbar = () => {
  const {
    user,
    profile
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
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
  const getRoleBadge = () => {
    if (!profile?.role) return null;
    const roleColors = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      wholesaler: 'bg-pakistani_green-100 text-pakistani_green-800 dark:bg-pakistani_green-900/20 dark:text-pakistani_green-300',
      seller: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full font-poppins ${roleColors[profile.role as keyof typeof roleColors] || roleColors.pending}`}>
        {profile.role}
      </span>;
  };
  return <>
      {/* Top Banner */}
      <div className="bg-pakistani_green-700 text-white py-2 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Flag className="w-40 h-40 text-white" />
        </div>
        
      </div>

      {/* Main Navbar */}
      <header className="bg-white dark:bg-gray-950 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 md:h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity">
                <div className="bg-pakistani_green-700 rounded-lg md:rounded-xl p-1.5 md:p-2 shadow-md hover:shadow-lg transition-shadow">
                  <span className="text-white text-lg md:text-xl font-bold">PBC</span>
                </div>
                <span className="text-lg md:text-xl font-bold text-pakistani_green-800 dark:text-white hidden sm:inline font-poppins">
                  Pak Bazaar Connect
                </span>
              </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Main Navigation Links */}
              <div className="flex items-center space-x-1">
                <Link to="/products">
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins transition-all duration-200">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Products
                  </Button>
                </Link>
                <Link to="/dashboard/browse-shops">
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 font-poppins transition-all duration-200">
                    <Users className="w-4 h-4 mr-2" />
                    Shops
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins transition-all duration-200">
                    <Zap className="w-4 h-4 mr-2" />
                    Features
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins transition-all duration-200">
                    <Package className="w-4 h-4 mr-2" />
                    Demo
                  </Button>
                </Link>
                <Link to="/blog">
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins transition-all duration-200">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Blog
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins transition-all duration-200">
                    <Users className="w-4 h-4 mr-2" />
                    About
                  </Button>
                </Link>
              </div>

              {user ? <UserMenu email={profile?.email || user.email} role={profile?.role} onLogout={handleLogout} getRoleBadge={getRoleBadge} /> : <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <Button variant="ghost" className="text-pakistani_green-700 dark:text-pakistani_green-300 hover:text-pakistani_green-800 dark:hover:text-pakistani_green-200 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-pakistani_green-700 hover:bg-pakistani_green-800 text-white font-poppins shadow-md transition-all duration-200 hover:shadow-lg">
                      Sign Up
                    </Button>
                  </Link>
                </div>}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon-sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20" aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}>
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} user={user} profile={profile} onLogout={handleLogout} />
      </header>
    </>;
};
export default Navbar;