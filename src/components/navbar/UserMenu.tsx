
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
import { User, LayoutDashboard, LogOut, ChevronDown, Heart, MessageSquare, BarChart, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface UserMenuProps {
  email?: string;
  role?: string;
  onLogout: () => void;
  getRoleBadge: () => React.ReactNode;
}

const UserMenu: React.FC<UserMenuProps> = ({ email, role, onLogout, getRoleBadge }) => {
  const { theme, setTheme } = useTheme();
  
  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 font-poppins hover:bg-primary/10">
          <User className="h-4 w-4" />
          <span className="font-medium max-w-20 truncate text-foreground">{email?.split('@')[0]}</span>
          {getRoleBadge()}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-popover border border-border shadow-lg z-[200]">
        <DropdownMenuLabel className="font-poppins text-foreground">
          <div className="flex flex-col space-y-1">
            <span className="font-medium">{email}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Role:</span>
              {getRoleBadge()}
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Profile & Dashboard */}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer flex items-center gap-3 font-poppins text-foreground hover:text-primary">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer flex items-center gap-3 font-poppins text-foreground hover:text-primary">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        {/* Additional Features */}
        <DropdownMenuItem asChild>
          <Link to="/favorites" className="cursor-pointer flex items-center gap-3 font-poppins text-foreground hover:text-primary">
            <Heart className="h-4 w-4" />
            Favorites
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/messages" className="cursor-pointer flex items-center gap-3 font-poppins text-foreground hover:text-primary">
            <MessageSquare className="h-4 w-4" />
            Messages
          </Link>
        </DropdownMenuItem>
        {role === 'wholesaler' && (
          <DropdownMenuItem asChild>
            <Link to="/dashboard/analytics" className="cursor-pointer flex items-center gap-3 font-poppins text-foreground hover:text-primary">
              <BarChart className="h-4 w-4" />
              Analytics
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Theme Toggle */}
        <DropdownMenuItem 
          onClick={handleThemeToggle}
          className="cursor-pointer flex items-center gap-3 font-poppins text-foreground hover:text-primary"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        {/* Logout */}
        <DropdownMenuItem 
          onClick={onLogout} 
          className="text-destructive cursor-pointer flex items-center gap-3 font-poppins hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
