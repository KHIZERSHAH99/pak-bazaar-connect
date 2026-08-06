import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, ShoppingBag, Users, Home, Settings, Sun, Moon, LogOut, HelpCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: any;
  onLogout: () => void;
  onShowTutorial?: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  profile, 
  onLogout,
  onShowTutorial 
}) => {
  const { theme, setTheme } = useTheme();
  const { t, language } = useLanguage();
  const isRtl = language === 'ur';

  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="md:hidden fixed inset-x-0 top-[3.5rem] bottom-0 z-50 bg-background animate-slide-in-right overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="px-3 py-3 space-y-3 h-full overflow-y-auto overflow-x-hidden max-w-full">
        {/* Main Navigation */}
        <div className="space-y-1">
          <Link to="/" onClick={handleLinkClick}>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 text-sm text-foreground hover:bg-accent font-poppins"
            >
              <Home className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'}`} />
              {t('home')}
            </Button>
          </Link>
          
          <Link to="/products" onClick={handleLinkClick}>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 text-sm text-foreground hover:bg-accent font-poppins"
            >
              <ShoppingBag className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'}`} />
              {t('products')}
            </Button>
          </Link>
          
          <Link to="/shops" onClick={handleLinkClick}>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-12 text-sm text-foreground hover:bg-accent font-poppins"
            >
              <Users className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'}`} />
              {t('shops')}
            </Button>
          </Link>
        </div>

        {/* User Section */}
        {user ? (
          <div className="space-y-2 border-t border-border pt-2">
            {/* User Info */}
            {profile && (
              <div className="flex items-center gap-2 p-2 bg-accent rounded-lg">
                <div className="bg-primary/10 p-1.5 rounded-full">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground font-poppins text-xs truncate">
                    {profile.contact_name || profile.business_name || profile.email}
                  </p>
                  <Badge variant="secondary" className="text-[10px] font-poppins mt-0.5 px-1.5 py-0">
                    {t(profile.role)}
                  </Badge>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-1">
              <Link to="/dashboard" onClick={handleLinkClick}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-sm text-foreground hover:bg-accent font-poppins font-semibold"
                >
                  <Settings className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'}`} />
                  {t('dashboard')}
                </Button>
              </Link>

              <Link to="/profile" onClick={handleLinkClick}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-sm text-foreground hover:bg-accent font-poppins"
                >
                  <User className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'}`} />
                  {t('profile')}
                </Button>
              </Link>
            </div>

            {/* Controls Section */}
            <div className="space-y-1 border-t border-border pt-2">
              {/* Tutorial Button */}
              {onShowTutorial && (profile?.role === 'wholesaler' || profile?.role === 'seller') && (
                <Button
                  onClick={onShowTutorial}
                  variant="ghost"
                  className="w-full justify-start h-12 text-sm text-foreground hover:bg-accent font-poppins"
                >
                  <HelpCircle className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'}`} />
                  {t('help')}
                </Button>
              )}

              {/* Theme Toggle */}
              <Button
                onClick={handleThemeToggle}
                variant="ghost"
                className="w-full justify-start h-12 text-sm text-foreground hover:bg-accent font-poppins"
              >
                {theme === 'light' ? <Moon className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'}`} /> : <Sun className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'}`} />}
                {theme === 'light' ? t('darkMode') : t('lightMode')}
              </Button>
            </div>

            {/* Logout Button */}
            <Button
              onClick={() => {
                onLogout();
                onClose();
              }}
              variant="destructive"
              className="w-full h-12 text-sm font-poppins mt-2"
            >
              <LogOut className={`w-5 h-5 ${isRtl ? 'ml-3' : 'mr-3'}`} />
              {t('logout')}
            </Button>
          </div>
        ) : (
          <div className="space-y-2 border-t border-border pt-2">
            <Link to="/login" onClick={handleLinkClick}>
              <Button 
                variant="outline" 
                className="w-full h-12 text-sm font-poppins"
              >
                {t('login')}
              </Button>
            </Link>
            <Link to="/signup" onClick={handleLinkClick}>
              <Button className="w-full h-12 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-poppins">
                {t('signup')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
