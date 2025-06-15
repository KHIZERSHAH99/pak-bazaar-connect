
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { changeRole, UserRole } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const roleDisplay: Record<UserRole, string> = {
  admin: 'Admin',
  wholesaler: 'Wholesaler',
  seller: 'Seller',
  pending: 'Pending'
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-600 text-white',
  wholesaler: 'bg-pakistani_green-700 text-white',
  seller: 'bg-blue-600 text-white',
  pending: 'bg-gray-400 text-white'
};

const nextRole: Record<UserRole, UserRole> = {
  seller: 'wholesaler',
  wholesaler: 'seller',
  admin: 'admin', // Admin can't switch here
  pending: 'seller' // Pending (if ever shown) switches to seller
};

const RoleSwitcher: React.FC = () => {
  const { profile, checkAuthStatus } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);
  const { toast } = useToast();

  if (!profile) return null;

  const canSwitch = profile.role === "seller" || profile.role === "wholesaler";
  const handleSwitch = async () => {
    if (!canSwitch) return;
    setIsSwitching(true);
    try {
      await changeRole(nextRole[profile.role as UserRole]);
      await checkAuthStatus();
      toast({
        title: "Role Switched",
        description: `Your role has been changed to ${roleDisplay[nextRole[profile.role as UserRole]]}.`,
        variant: "success"
      });
    } catch(e) {
      toast({
        title: "Failed to switch role",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="flex items-center gap-1 relative ml-2">
      <Badge className={`capitalize px-2 py-1 text-xs font-poppins shadow-sm transition ring-2 ring-pakistani_green-400 dark:ring-pakistani_green-700 ${roleColors[profile.role as UserRole]} flex items-center gap-1`}
        onClick={canSwitch ? handleSwitch : undefined}
        title={canSwitch ? `Switch to ${roleDisplay[nextRole[profile.role as UserRole]]}` : 'Role cannot be changed here'}
        style={canSwitch ? { cursor: 'pointer' } : { cursor: 'not-allowed' }}
        tabIndex={canSwitch ? 0 : -1}
        aria-label={canSwitch ? `Switch to ${roleDisplay[nextRole[profile.role as UserRole]]}` : undefined}
        data-testid="role-switcher"
      >
        {roleDisplay[profile.role as UserRole]}
        {isSwitching ? (
          <span className="ml-1 animate-spin">&#9696;</span>
        ) : (
          canSwitch && <span className="ml-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" d="M6 9l6 6 6-6" />
            </svg>
          </span>
        )}
      </Badge>
    </div>
  );
};

export default RoleSwitcher;
