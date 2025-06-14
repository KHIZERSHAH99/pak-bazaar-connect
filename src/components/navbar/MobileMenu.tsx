
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LayoutDashboard, User, LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';

interface MobileMenuProps {
  isOpen: boolean;
  user: any;
  onItemClick: () => void;
  onLogout: () => void;
  getRoleBadge: () => React.ReactNode;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  user, 
  onItemClick, 
  onLogout, 
  getRoleBadge 
}) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="md:hidden py-4 px-2 space-y-3 border-t border-border animate-slideIn bg-card/95 backdrop-blur-sm">
      <Link 
        to="/" 
        className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-muted text-foreground transition-all duration-200 font-poppins group"
        onClick={onItemClick}
      >
        <Home className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        <span className="font-medium">{t('home')}</span>
      </Link>
      
      {user ? (
        <>
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-muted text-foreground transition-all duration-200 font-poppins group"
            onClick={onItemClick}
          >
            <LayoutDashboard className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="font-medium">{t('dashboard')}</span>
          </Link>
          
          <Link 
            to="/profile" 
            className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-muted text-foreground transition-all duration-200 font-poppins group"
            onClick={onItemClick}
          >
            <User className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="flex items-center gap-2">
              <span className="font-medium">{t('profile')}</span>
              {getRoleBadge()}
            </div>
          </Link>
          
          <div className="flex items-center justify-between py-3 px-4">
            <span className="font-medium text-foreground font-poppins">Settings</span>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
          
          <button
            className="w-full text-left flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-destructive/10 text-destructive transition-all duration-200 font-poppins group"
            onClick={() => {
              onLogout();
              onItemClick();
            }}
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{t('logout')}</span>
          </button>
        </>
      ) : (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between py-3 px-4">
            <span className="font-medium text-foreground font-poppins">Settings</span>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
          
          <Link 
            to="/login" 
            className="block py-3 px-4 rounded-lg hover:bg-muted text-foreground transition-all duration-200 font-poppins text-center font-medium"
            onClick={onItemClick}
          >
            {t('login')}
          </Link>
          
          <Link 
            to="/signup" 
            className="block py-3 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-poppins text-center font-medium transition-all duration-200 shadow-sm"
            onClick={onItemClick}
          >
            {t('signup')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
