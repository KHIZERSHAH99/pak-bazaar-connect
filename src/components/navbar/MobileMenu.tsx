
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
    <div className="md:hidden fixed inset-x-0 top-[3.5rem] bottom-0 z-50 bg-background animate-slide-in-right overflow-hidden">
      <div className="px-4 py-4 space-y-4 h-full overflow-y-auto overflow-x-hidden max-w-full">
        {/* Main Navigation */}
        <div className="space-y-2">
          <Link to="/" onClick={handleLinkClick}>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 text-foreground hover:bg-accent font-poppins"
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </Button>
          </Link>
          
          <Link to="/products" onClick={handleLinkClick}>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 text-foreground hover:bg-accent font-poppins"
            >
              <ShoppingBag className="w-5 h-5 mr-3" />
              Products
            </Button>
          </Link>
          
          <Link to="/dashboard/browse-shops" onClick={handleLinkClick}>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 text-foreground hover:bg-accent font-poppins"
            >
              <Users className="w-5 h-5 mr-3" />
              Wholesalers
            </Button>
          </Link>
          
          <Link to="/features" onClick={handleLinkClick}>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 text-foreground hover:bg-accent font-poppins"
            >
              <Zap className="w-5 h-5 mr-3" />
              Features
            </Button>
          </Link>
        </div>

        {/* User Section */}
        {user ? (
          <div className="space-y-3 border-t border-gray-200 dark:border-gray-800 pt-3">
            {/* User Info */}
            {profile && (
              <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground font-poppins text-sm truncate">
                    {profile.email}
                  </p>
                  <Badge variant="secondary" className="text-xs font-poppins mt-0.5">
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
                  className="w-full justify-start h-12 text-foreground hover:bg-accent font-poppins"
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </Button>
              </Link>

              <Link to="/dashboard" onClick={handleLinkClick}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-foreground hover:bg-accent font-poppins font-semibold"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Dashboard
                </Button>
              </Link>

              <Link to="/favorites" onClick={handleLinkClick}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-foreground hover:bg-accent font-poppins"
                >
                  <Heart className="w-5 h-5 mr-3" />
                  Favorites
                </Button>
              </Link>

              <Link to="/messages" onClick={handleLinkClick}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-foreground hover:bg-accent font-poppins"
                >
                  <MessageSquare className="w-5 h-5 mr-3" />
                  Messages
                </Button>
              </Link>

              {profile?.role === 'wholesaler' && (
                <Link to="/analytics" onClick={handleLinkClick}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start h-12 text-foreground hover:bg-accent font-poppins"
                  >
                    <BarChart className="w-5 h-5 mr-3" />
                    Analytics
                  </Button>
                </Link>
              )}
            </div>

            {/* Controls Section */}
            <div className="space-y-2 border-t border-border pt-4">
              {/* Theme Toggle */}
              <Button
                onClick={handleThemeToggle}
                variant="ghost"
                className="w-full justify-start h-12 text-foreground hover:bg-accent font-poppins"
              >
                {theme === 'light' ? <Moon className="w-5 h-5 mr-3" /> : <Sun className="w-5 h-5 mr-3" />}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Button>
            </div>

            {/* Logout Button */}
            <Button
              onClick={() => {
                onLogout();
                onClose();
              }}
              variant="destructive"
              className="w-full h-12 font-poppins mt-4"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-2 border-t border-border pt-4">
            <Link to="/login" onClick={handleLinkClick}>
              <Button 
                variant="outline" 
                className="w-full h-12 font-poppins"
              >
                Login
              </Button>
            </Link>
            <Link to="/signup" onClick={handleLinkClick}>
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-poppins">
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
