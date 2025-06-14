import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, ChevronDown, Moon, Sun, Globe } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import MobileMenu from './navbar/MobileMenu';
import LanguageToggle from './LanguageToggle';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { userProfile } = useProfile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const getRoleBadge = () => {
    if (!userProfile?.role) return null;

    let badgeColor = 'bg-gray-500';
    if (userProfile.role === 'admin') {
      badgeColor = 'bg-red-500';
    } else if (userProfile.role === 'wholesaler') {
      badgeColor = 'bg-green-500';
    } else if (userProfile.role === 'seller') {
      badgeColor = 'bg-blue-500';
    }

    return (
      <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${badgeColor} text-white`}>
        {userProfile.role}
      </span>
    );
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img className="h-8 w-auto" src="/placeholder.svg" alt="Pak Bazaar Connect" />
                <span className="ml-2 text-lg font-bold text-primary font-poppins">Pak Bazaar Connect</span>
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/"
                className="border-transparent text-foreground hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-poppins"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="border-transparent text-foreground hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-poppins"
              >
                Products
              </Link>
              <Link
                to="/sellers"
                className="border-transparent text-foreground hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-poppins"
              >
                Suppliers
              </Link>
              <Link
                to="/features"
                className="border-transparent text-foreground hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-poppins"
              >
                Features
              </Link>
            </div>
          </div>

          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <LanguageToggle />
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5 font-poppins">
                    <User className="h-4 w-4" />
                    <span className="font-medium max-w-20 truncate">{user.email?.split('@')[0]}</span>
                    {getRoleBadge()}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
                  <DropdownMenuLabel className="font-poppins">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex items-center gap-2 font-poppins">
                      <User className="h-4 w-4" />
                      {t('profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer flex items-center gap-2 font-poppins">
                      <LayoutDashboard className="h-4 w-4" />
                      {t('dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer flex items-center gap-2 font-poppins">
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-foreground hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium font-poppins"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary hover:bg-pakistani_green-700 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium font-poppins"
                >
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />
            <MobileMenu
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              user={user}
              userProfile={userProfile}
              handleLogout={handleLogout}
              getRoleBadge={getRoleBadge}
              t={t}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import { LayoutDashboard, LogOut, ChevronDown, Moon, Sun, Globe } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import MobileMenu from './navbar/MobileMenu';
import LanguageToggle from './LanguageToggle';

interface UserMenuProps {
  email?: string;
  role?: string;
  onLogout: () => void;
  getRoleBadge: () => React.ReactNode;
}

const UserMenu: React.FC<UserMenuProps> = ({ email, role, onLogout, getRoleBadge }) => {
  const { t } = useLanguage();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 font-poppins">
          <User className="h-4 w-4" />
          <span className="font-medium max-w-20 truncate">{email?.split('@')[0]}</span>
          {getRoleBadge()}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuLabel className="font-poppins">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer flex items-center gap-2 font-poppins">
            <User className="h-4 w-4" />
            {t('profile')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer flex items-center gap-2 font-poppins">
            <LayoutDashboard className="h-4 w-4" />
            {t('dashboard')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/favorites" className="cursor-pointer flex items-center gap-2 font-poppins">
            <Heart className="h-4 w-4" />
            Favorites
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/messages" className="cursor-pointer flex items-center gap-2 font-poppins">
            <MessageSquare className="h-4 w-4" />
            Messages
          </Link>
        </DropdownMenuItem>
        {role === 'wholesaler' && (
          <DropdownMenuItem asChild>
            <Link to="/analytics" className="cursor-pointer flex items-center gap-2 font-poppins">
              <BarChart className="h-4 w-4" />
              Analytics
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-destructive cursor-pointer flex items-center gap-2 font-poppins">
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Navbar;
