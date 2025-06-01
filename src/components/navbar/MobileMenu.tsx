
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LayoutDashboard, User, LogOut } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="md:hidden py-4 px-2 space-y-3 border-t border-gray-200 animate-in slide-in-from-top">
      <Link 
        to="/" 
        className="flex items-center gap-2 py-3 px-4 rounded-md hover:bg-pakistani_green-50 text-gray-700 font-poppins"
        onClick={onItemClick}
      >
        <Home className="h-5 w-5" />
        Home
      </Link>
      
      {user ? (
        <>
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 py-3 px-4 rounded-md hover:bg-pakistani_green-50 text-gray-700 font-poppins"
            onClick={onItemClick}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          
          <Link 
            to="/profile" 
            className="flex items-center gap-2 py-3 px-4 rounded-md hover:bg-pakistani_green-50 text-gray-700 font-poppins"
            onClick={onItemClick}
          >
            <User className="h-5 w-5" />
            <span className="flex items-center gap-2">
              Profile 
              {getRoleBadge()}
            </span>
          </Link>
          
          <button
            className="w-full text-left flex items-center gap-2 py-3 px-4 rounded-md hover:bg-red-50 text-red-600 font-poppins"
            onClick={() => {
              onLogout();
              onItemClick();
            }}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <Link 
            to="/login" 
            className="block py-3 px-4 rounded-md hover:bg-pakistani_green-50 text-gray-700 font-poppins"
            onClick={onItemClick}
          >
            Login
          </Link>
          
          <Link 
            to="/signup" 
            className="block py-3 px-4 rounded-md bg-pakistani_green-700 text-white font-poppins text-center"
            onClick={onItemClick}
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
