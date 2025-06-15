import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, ChevronDown } from 'lucide-react';
import MobileMenu from './navbar/MobileMenu';
import LanguageToggle from './LanguageToggle';
import { signOut } from '@/lib/auth';
import RoleSwitcher from './navbar/RoleSwitcher';

const Navbar: React.FC = () => {
  const { user, profile } = useAuth(); // Remove logout from destructuring
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const getRoleBadge = () => {
    if (!profile?.role) return null;

    let badgeColor = 'bg-gray-500';
    if (profile.role === 'admin') {
      badgeColor = 'bg-red-500';
    } else if (profile.role === 'wholesaler') {
      badgeColor = 'bg-green-500';
    } else if (profile.role === 'seller') {
      badgeColor = 'bg-blue-500';
    }

    return (
      <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${badgeColor} text-white`}>
        {profile.role}
      </span>
    );
  };

  // MobileMenu expected: isOpen, user, onItemClick, onLogout, getRoleBadge
  const handleMobileMenuItemClick = () => setIsMenuOpen(false);

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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 font-poppins focus:outline-none focus:ring-2 focus:ring-primary/70 px-2 h-10"
                  >
                    <User className="h-4 w-4" />
                    <span className="font-medium max-w-20 truncate">{user.email?.split('@')[0]}</span>
                    {/* Keep RoleSwitcher perfectly inline */}
                    <RoleSwitcher />
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-popover text-popover-foreground border-border shadow-lg rounded-md animate-fade-in"
                >
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
                      {t('dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive cursor-pointer flex items-center gap-2 font-poppins"
                  >
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
                {/* Only show Sign Up when user is NOT logged in */}
                {!user && (
                  <Link
                    to="/signup"
                    className="bg-primary hover:bg-pakistani_green-700 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium font-poppins"
                  >
                    {t('signup')}
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />
            <MobileMenu
              isOpen={isMenuOpen}
              user={user}
              onItemClick={handleMobileMenuItemClick}
              onLogout={handleLogout}
              getRoleBadge={getRoleBadge}
            />
            {/* Add Hamburger Button */}
            <button
              type="button"
              aria-label="Open menu"
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
