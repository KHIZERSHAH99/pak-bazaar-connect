
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
        md:block bg-card md:bg-card backdrop-blur-sm md:backdrop-blur-none border-r border-border w-72 sm:w-64 flex-shrink-0 h-full overflow-y-auto`}
    >
      {/* Mobile header with close button */}
      <div className="md:hidden sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground font-poppins">Menu</h2>
        <Button 
          variant="ghost"
          size="icon"
          onClick={closeSidebar}
          className="hover:bg-muted rounded-lg"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4">
        <UserProfile />
        <h2 className="hidden md:block text-lg font-semibold text-foreground mb-4 px-3 font-poppins">Navigation</h2>
        <DashboardNavigation onNavigate={closeSidebar} />
      </div>
    </aside>
  );
};

export default DashboardSidebar;
