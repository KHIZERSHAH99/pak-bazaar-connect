
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, LogIn, LogOut, Package, Settings, User, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Navbar: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center">
            <div className="mr-3">
              <img 
                src="https://lljiqniebnmfbytbkjkv.supabase.co/storage/v1/object/public/public/pbc-logo.png" 
                alt="PBC Logo" 
                className="h-10 w-auto"
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.currentTarget.src = "https://via.placeholder.com/40x40?text=PBC";
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary tracking-tight">PBC</span>
              <span className="text-xs font-light text-gray-600 -mt-1">Pak Bazaar Connect</span>
            </div>
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
              <Link to="/signup" className="bg-pakistani-green-800 hover:bg-pakistani-green-900 text-white px-4 py-2 rounded-md transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-xs w-[80vw]">
              <div className="flex flex-col space-y-4 py-4">
                <Link 
                  to="/" 
                  className="flex items-center px-2 py-1 rounded-md hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <Home className="h-4 w-4 mr-2" />
                  <span>Home</span>
                </Link>
                
                {user ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="flex items-center px-2 py-1 rounded-md hover:bg-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Dashboard</span>
                    </Link>
                    <Link 
                      to="/profile" 
                      className="flex items-center px-2 py-1 rounded-md hover:bg-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </Link>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="flex items-center px-2 py-1 rounded-md hover:bg-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      <span>Login</span>
                    </Link>
                    <Link 
                      to="/signup" 
                      className="flex items-center px-2 py-1 rounded-md bg-pakistani-green-800 hover:bg-pakistani-green-900 text-white justify-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
