
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import MobileMenu from '@/components/ui/MobileMenu';
import { LogOut, User, MessageSquare } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="bg-pakistani_green-600 text-white px-3 py-1 rounded-lg font-bold text-lg font-poppins">
                PBC
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white font-poppins hidden sm:block">
                Pak Bazaar Connect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-pakistani_green-600 dark:hover:text-pakistani_green-400 font-poppins transition-colors">
              {t('home') || 'Home'}
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-pakistani_green-600 dark:hover:text-pakistani_green-400 font-poppins transition-colors">
                  {t('dashboard') || 'Dashboard'}
                </Link>
                <Link to="/dashboard/chat" className="text-gray-700 dark:text-gray-200 hover:text-pakistani_green-600 dark:hover:text-pakistani_green-400 font-poppins transition-colors">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  {t('support') || 'Support'}
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="font-poppins">
                    <User className="h-4 w-4 mr-2" />
                    {t('profile') || 'Profile'}
                  </Button>
                </Link>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="font-poppins">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('logout') || 'Logout'}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-poppins">
                    {t('login') || 'Login'}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="font-poppins">
                    {t('signup') || 'Sign Up'}
                  </Button>
                </Link>
              </>
            )}
            
            <LanguageToggle />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageToggle />
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
