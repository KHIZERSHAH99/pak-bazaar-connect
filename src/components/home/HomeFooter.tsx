
import React from 'react';
import { Shield, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomeFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary text-primary-foreground py-8 px-3 md:px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start items-center mb-4">
              <div className="bg-primary-foreground/10 rounded-xl p-2 shadow-md mr-2 md:mr-3">
                <span className="text-primary-foreground text-lg font-bold">PBC</span>
              </div>
              <span className="text-lg md:text-xl font-bold font-poppins">Pak Bazaar Connect</span>
            </div>
            <p className="text-primary-foreground/70 mb-2 md:mb-4 font-poppins">
              Connecting Pakistani businesses for sustainable growth
            </p>
            <div className="flex justify-center md:justify-start items-center space-x-2 md:space-x-4 text-xs md:text-sm">
              <span className="flex items-center font-poppins">
                <Shield className="h-4 w-4 mr-1" aria-hidden="true" />
                Trusted marketplace with secure API infrastructure
              </span>
            </div>
          </div>
          
          {/* Back to Top Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={scrollToTop}
            className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground transition-colors"
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            Back to Top
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
