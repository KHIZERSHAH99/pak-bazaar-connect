
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

interface HomeHeaderProps {
  user: User | null;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ user }) => {
  return (
    <header className="bg-card/80 backdrop-blur-sm shadow-lg py-4 px-6 sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center group">
          <div className="bg-primary rounded-xl p-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
            <span className="text-primary-foreground text-2xl font-bold">PBC</span>
          </div>
          <span className="ml-3 text-xl font-bold text-foreground hidden md:inline">
            Pak Bazaar Connect
          </span>
        </Link>
        
        <nav className="flex items-center space-x-3">
          <Link to="/products">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 font-poppins">
              Browse Products
            </Button>
          </Link>
          {user ? (
            <Link to="/dashboard">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-poppins shadow-lg">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10 font-poppins">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-poppins shadow-lg">
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
