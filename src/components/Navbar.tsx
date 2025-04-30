
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, LogIn, LogOut, Package, Settings, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-primary">Pak Bazaar Connect</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
            <div className="flex items-center space-x-1">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </div>
          </Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-primary transition-colors">
                <div className="flex items-center space-x-1">
                  <Settings className="h-4 w-4" />
                  <span>Dashboard</span>
                </div>
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-primary transition-colors">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </div>
              </Link>
              <Button 
                variant="outline"
                onClick={handleLogout}
                className="text-gray-600 hover:text-primary"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-primary transition-colors">
                <div className="flex items-center space-x-1">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </div>
              </Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center">
          {/* Mobile menu button - we'll implement this later */}
          <button className="text-gray-500 hover:text-primary focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
