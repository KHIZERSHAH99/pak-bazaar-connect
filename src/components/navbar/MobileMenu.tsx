
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, ShoppingBag, Users, Zap, Home, Settings, Sun, Moon, Heart, MessageSquare, BarChart, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';

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
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="px-4 py-6 space-y-4 max-h-[80vh] overflow-y-auto">
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
          
          <Link to="/browse-shops" onClick={handleLinkClick}>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 font-poppins"
            >
              <Users className="w-4 h-4 mr-3" />
              Browse Shops
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

        {/* User Section */}
        {user ? (
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-800 pt-4">
            {/* User Info */}
            {profile && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="bg-pakistani_green-100 dark:bg-pakistani_green-900/50 p-2 rounded-full">
                  <User className="w-5 h-5 text-pakistani_green-700 dark:text-pakistani_green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white font-poppins text-sm">
                    {profile.email}
                  </p>
                  <Badge variant="secondary" className="text-xs font-poppins mt-1">
                    {profile.role}
                  </Badge>
                </div>
              </div>
            )}

            {/* User Actions */}
            <div className="space-y-2">
              <Link to="/profile" onClick={handleLinkClick}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </Button>
              </Link>

              <Link to="/dashboard" onClick={handleLinkClick}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-pakistani_green-700 dark:text-pakistani_green-300 hover:text-pakistani_green-800 dark:hover:text-pakistani_green-200 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Dashboard
                </Button>
              </Link>

              <Link to="/favorites" onClick={handleLinkClick}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
                >
                  <Heart className="w-4 h-4 mr-3" />
                  Favorites
                </Button>
              </Link>

              <Link to="/messages" onClick={handleLinkClick}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
                >
                  <MessageSquare className="w-4 h-4 mr-3" />
                  Messages
                </Button>
              </Link>

              {profile?.role === 'wholesaler' && (
                <Link to="/analytics" onClick={handleLinkClick}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
                  >
                    <BarChart className="w-4 h-4 mr-3" />
                    Analytics
                  </Button>
                </Link>
              )}
            </div>

            {/* Controls Section */}
            <div className="space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
              {/* Theme Toggle */}
              <Button
                onClick={handleThemeToggle}
                variant="ghost"
                className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 font-poppins"
              >
                {theme === 'light' ? <Moon className="w-4 h-4 mr-3" /> : <Sun className="w-4 h-4 mr-3" />}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Button>
            </div>

            {/* Logout Button */}
            <Button
              onClick={() => {
                onLogout();
                onClose();
              }}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 font-poppins"
            >
              <LogOut className="w-4 h-4 mr-3" />
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
                Wholesaler Login
              </Button>
            </Link>
            <Link to="/signup" onClick={handleLinkClick}>
              <Button className="w-full bg-pakistani_green-700 hover:bg-pakistani_green-800 text-white font-poppins">
                Become Wholesaler
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
