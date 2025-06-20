
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X, Home, User, MessageSquare, LogOut, LogIn, UserPlus } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';

const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeMenu = () => setIsOpen(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      closeMenu();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { label: t('home') || 'Home', href: '/', icon: Home },
    ...(user ? [
      { label: t('dashboard') || 'Dashboard', href: '/dashboard', icon: User },
      { label: t('support_chat') || 'Support', href: '/dashboard/chat', icon: MessageSquare },
    ] : [])
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={closeMenu} />
          <div className="fixed right-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold font-poppins">Menu</h2>
              <Button variant="ghost" size="icon" onClick={closeMenu}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={closeMenu}
                  className="flex items-center gap-3 w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-poppins">{item.label}</span>
                </Link>
              ))}
              
              <div className="pt-4 border-t">
                <div className="mb-4">
                  <LanguageToggle />
                </div>
                
                {user ? (
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full justify-start font-poppins"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('logout') || 'Logout'}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" onClick={closeMenu}>
                      <Button className="w-full justify-start font-poppins">
                        <LogIn className="h-4 w-4 mr-2" />
                        {t('login') || 'Login'}
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={closeMenu}>
                      <Button variant="outline" className="w-full justify-start font-poppins">
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t('signup') || 'Sign Up'}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
