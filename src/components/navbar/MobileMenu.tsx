
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, ShoppingBag, Users, Zap, Home, Settings } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import EnhancedRoleSwitcher from './EnhancedRoleSwitcher';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
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

  return (
    <div className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="px-4 py-6 space-y-4">
        {/* Main Navigation */}
        <div className="space-y-2">
          <Link to="/" onClick={handleLinkClick}>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
            >
              <Home className="w-4 h-4 mr-3" />
              Home
            </Button>
          </Link>
          
          <Link to="/products" onClick={handleLinkClick}>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
            >
              <ShoppingBag className="w-4 h-4 mr-3" />
              Products
            </Button>
          </Link>
          
          <Link to="/sellers" onClick={handleLinkClick}>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
            >
              <Users className="w-4 h-4 mr-3" />
              Sellers
            </Button>
          </Link>
          
          <Link to="/features" onClick={handleLinkClick}>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
            >
              <Zap className="w-4 h-4 mr-3" />
              Features
            </Button>
          </Link>
        </div>

        {/* Theme and Language Controls */}
        <div className="space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">Theme</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-poppins">Language</span>
            <LanguageToggle />
          </div>
        </div>

        {/* User Section */}
        {user ? (
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-800 pt-4">
            {/* User Info & Role Switcher */}
            {profile && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-pakistani_green-100 dark:bg-pakistani_green-900/50 p-2 rounded-full">
                    <User className="w-5 h-5 text-pakistani_green-700 dark:text-pakistani_green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white font-poppins text-sm">
                      {profile.email}
                    </p>
                    <Badge variant="secondary" className="text-xs font-poppins mt-1">
                      {profile.role}
                    </Badge>
                  </div>
                </div>
                
                <EnhancedRoleSwitcher />
              </div>
            )}

            {/* Dashboard Link */}
            <Link to="/dashboard" onClick={handleLinkClick}>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-pakistani_green-700 dark:text-pakistani_green-300 hover:text-pakistani_green-800 dark:hover:text-pakistani_green-200 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
              >
                <Settings className="w-4 h-4 mr-3" />
                Dashboard
              </Button>
            </Link>

            {/* Logout Button */}
            <Button
              onClick={() => {
                onLogout();
                onClose();
              }}
              variant="outline"
              className="w-full border-pakistani_green-700 text-pakistani_green-700 hover:bg-pakistani_green-700 hover:text-white dark:border-pakistani_green-300 dark:text-pakistani_green-300 dark:hover:bg-pakistani_green-700 dark:hover:text-white font-poppins"
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
            <Link to="/login" onClick={handleLinkClick}>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-pakistani_green-700 dark:text-pakistani_green-300 hover:text-pakistani_green-800 dark:hover:text-pakistani_green-200 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
              >
                Login
              </Button>
            </Link>
            <Link to="/signup" onClick={handleLinkClick}>
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
