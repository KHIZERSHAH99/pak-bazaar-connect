
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import UserProfile from './UserProfile';
import DashboardNavigation from './DashboardNavigation';

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-20 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:block bg-card md:bg-card backdrop-blur-sm md:backdrop-blur-none border-r border-border w-64 sm:w-60 flex-shrink-0 h-full overflow-y-auto`}
    >
      {/* Mobile header with close button */}
      <div className="md:hidden sticky top-0 bg-card border-b border-border p-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground font-poppins">Menu</h2>
        <Button 
          variant="ghost"
          size="icon"
          onClick={closeSidebar}
          className="hover:bg-muted rounded-lg h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3">
        <UserProfile />
        <h2 className="hidden md:block text-base font-semibold text-foreground mb-3 px-2 font-poppins">Navigation</h2>
        <DashboardNavigation onNavigate={closeSidebar} />
      </div>
    </aside>
  );
};

export default DashboardSidebar;
