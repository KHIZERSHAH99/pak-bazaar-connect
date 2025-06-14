
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types'; // Assuming User type is defined here or adjust as needed

interface HomeHeaderProps {
  user: User | null;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ user }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-lg py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center group">
          <div className="bg-gradient-to-r from-pakistani_green-700 to-pakistani_green-600 rounded-xl p-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
            <span className="text-white text-2xl font-bold">PBC</span>
          </div>
          <span className="ml-3 text-xl font-bold bg-gradient-to-r from-pakistani_green-800 to-green-700 bg-clip-text text-transparent hidden md:inline">
            Pak Bazaar Connect
          </span>
        </Link>
        
        <nav className="flex items-center space-x-3">
          <Link to="/products">
            <Button variant="ghost" size="sm" className="text-pakistani_green-700 hover:bg-pakistani_green-50 font-poppins">
              Browse Products
            </Button>
          </Link>
          {user ? (
            <Link to="/dashboard">
              <Button size="sm" className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 hover:from-pakistani_green-700 hover:to-pakistani_green-800 font-poppins shadow-lg">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-pakistani_green-700 text-pakistani_green-700 hover:bg-pakistani_green-50 font-poppins">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 hover:from-pakistani_green-700 hover:to-pakistani_green-800 font-poppins shadow-lg">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default HomeHeader;
