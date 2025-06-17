
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/ui/language-toggle';
import EnhancedRoleSwitcher from './EnhancedRoleSwitcher';
import { User } from '@supabase/supabase-js';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  profile: any;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  profile, 
  onLogout 
}) => {
  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg">
      <div className="px-4 py-4 space-y-4">
        {/* Language Toggle */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
            Language
          </span>
          <LanguageToggle />
        </div>

        {user ? (
          <div className="space-y-4">
            {/* Role Switcher */}
            {profile && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">
                  Current Role
                </span>
                <EnhancedRoleSwitcher />
              </div>
            )}

            {/* User Email */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-poppins">
                Signed in as: {user.email}
              </p>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              <Link 
                to="/dashboard" 
                onClick={handleLinkClick}
                className="block w-full"
              >
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-pakistani_green-700 dark:text-pakistani_green-300 hover:text-pakistani_green-800 dark:hover:text-pakistani_green-200 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
                >
                  Dashboard
                </Button>
              </Link>

              <Link 
                to="/profile" 
                onClick={handleLinkClick}
                className="block w-full"
              >
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-poppins"
                >
                  Profile
                </Button>
              </Link>

              <Link 
                to="/stats" 
                onClick={handleLinkClick}
                className="block w-full"
              >
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-poppins"
                >
                  Statistics
                </Button>
              </Link>

              <Link 
                to="/chat" 
                onClick={handleLinkClick}
                className="block w-full"
              >
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-poppins"
                >
                  Support Chat
                </Button>
              </Link>
            </div>

            {/* Logout Button */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-pakistani_green-700 text-pakistani_green-700 hover:bg-pakistani_green-700 hover:text-white dark:border-pakistani_green-300 dark:text-pakistani_green-300 dark:hover:bg-pakistani_green-700 dark:hover:text-white font-poppins"
              >
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Link 
              to="/login" 
              onClick={handleLinkClick}
              className="block w-full"
            >
              <Button 
                variant="ghost" 
                className="w-full justify-start text-pakistani_green-700 dark:text-pakistani_green-300 hover:text-pakistani_green-800 dark:hover:text-pakistani_green-200 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
              >
                Login
              </Button>
            </Link>
            <Link 
              to="/signup" 
              onClick={handleLinkClick}
              className="block w-full"
            >
              <Button className="w-full bg-pakistani_green-700 hover:bg-pakistani_green-800 text-white font-poppins">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
