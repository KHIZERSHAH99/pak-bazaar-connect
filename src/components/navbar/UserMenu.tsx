
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LayoutDashboard, LogOut, ChevronDown, Heart, MessageSquare, BarChart } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserMenuProps {
  email?: string;
  role?: string;
  onLogout: () => void;
  getRoleBadge: () => React.ReactNode;
}

const UserMenu: React.FC<UserMenuProps> = ({ email, role, onLogout, getRoleBadge }) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center gap-2">
      <LanguageToggle />
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 font-poppins">
            <User className="h-4 w-4" />
            <span className="font-medium max-w-20 truncate">{email?.split('@')[0]}</span>
            {getRoleBadge()}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
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
          <DropdownMenuItem onClick={onLogout} className="text-red-600 cursor-pointer flex items-center gap-2 font-poppins">
            <LogOut className="h-4 w-4" />
            {t('logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
