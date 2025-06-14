
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface MobileBottomToggleProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const MobileBottomToggle: React.FC<MobileBottomToggleProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <div className="md:hidden fixed bottom-4 right-4 z-30">
      <Button
        className="rounded-full w-12 h-12 flex items-center justify-center bg-pakistani_green-700 hover:bg-pakistani_green-800 dark:bg-pakistani_green-600 dark:hover:bg-pakistani_green-700 shadow-lg"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
      </Button>
    </div>
  );
};

export default MobileBottomToggle;
