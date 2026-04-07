import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Menu, X, ShoppingBag, ShoppingCart, Users, HelpCircle } from 'lucide-react';
import UserMenu from './navbar/UserMenu';
import MobileMenu from './navbar/MobileMenu';
import LanguageToggle from './LanguageToggle';
import EnhancedWelcomeOnboarding from '@/components/ui/EnhancedWelcomeOnboarding';

const Navbar = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

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
      admin: 'bg-destructive/10 text-destructive',
      wholesaler: 'bg-primary/10 text-primary',
      seller: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      pending: 'bg-muted text-muted-foreground'
    };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full font-poppins ${roleColors[profile.role as keyof typeof roleColors] || roleColors.pending}`}>
        {profile.role}
      </span>;
  };

  return <>
      {/* Main Navbar — no top banner */}
      <header className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 md:h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity">
                <div className="bg-primary rounded-lg md:rounded-xl p-1.5 md:p-2 shadow-md hover:shadow-lg transition-shadow">
                  <span className="text-primary-foreground text-lg md:text-xl font-bold">PM</span>
                </div>
                <span className="text-lg md:text-xl font-bold text-foreground hidden lg:inline font-poppins">
                  PakMandi
                </span>
              </Link>

            {/* Desktop Navigation — simplified to core links only */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <Link to="/products">
                  <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10 font-poppins transition-all duration-200">
                    <ShoppingBag className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    {t('products')}
                  </Button>
                </Link>
                <Link to="/shops">
                  <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10 font-poppins transition-all duration-200">
                    <Users className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    Wholesalers
                  </Button>
                </Link>
              </div>

              {/* Help/Tour Button - Only for logged-in wholesalers and sellers */}
              {user && (profile?.role === 'wholesaler' || profile?.role === 'seller') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTutorial(true)}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 font-poppins"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </Button>
              )}

              {/* Cart Icon */}
              <Link to="/checkout" className="relative">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-destructive text-destructive-foreground">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Language Toggle */}
              <LanguageToggle />

              {user ? <UserMenu email={profile?.email || user.email} role={profile?.role} onLogout={handleLogout} getRoleBadge={getRoleBadge} /> : <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Link to="/login">
                    <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10 font-poppins">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-poppins shadow-md transition-all duration-200 hover:shadow-lg">
                      {t('signup')}
                    </Button>
                  </Link>
                </div>}
            </div>

            {/* Mobile Menu Button and Language Toggle */}
            <div className="md:hidden flex items-center gap-1">
              {/* Mobile Cart */}
              <Link to="/checkout" className="relative">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-9 w-9">
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[9px] bg-destructive text-destructive-foreground">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <LanguageToggle />
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-muted-foreground hover:text-primary hover:bg-primary/10" aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}>
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
          user={user} 
          profile={profile} 
          onLogout={handleLogout}
          onShowTutorial={() => {
            setShowTutorial(true);
            setIsMobileMenuOpen(false);
          }}
        />
      </header>

      {/* Tutorial Modal */}
      {showTutorial && profile?.role && (profile.role === 'wholesaler' || profile.role === 'seller') && (
        <EnhancedWelcomeOnboarding
          userRole={profile.role}
          onComplete={() => setShowTutorial(false)}
          onSkip={() => setShowTutorial(false)}
        />
      )}
    </>;
};
export default Navbar;
