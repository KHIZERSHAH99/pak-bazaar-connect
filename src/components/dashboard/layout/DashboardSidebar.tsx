
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import UserProfileCard from './UserProfileCard';
import SidebarNavItems from './SidebarNavItems';
import { Profile } from '@/lib/types';

interface DashboardSidebarProps {
  profile: Profile | null | undefined;
  isOpen: boolean;
  toggleSidebar: () => void;
  onLinkClick: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  profile,
  isOpen,
  toggleSidebar,
  onLinkClick,
}) => {
  return (
    <aside
      className={`fixed inset-0 z-20 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:block bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 w-64 flex-shrink-0`}
    >
      {/* Mobile close button */}
      <div className="md:hidden flex justify-end p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="p-4">
        <UserProfileCard profile={profile} />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 px-3">Dashboard</h2>
        <SidebarNavItems profile={profile} onLinkClick={onLinkClick} />
      </div>
    </aside>
  );
};

export default DashboardSidebar;
