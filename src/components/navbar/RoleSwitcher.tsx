
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowDown, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { changeRole, UserRole } from '@/lib/auth';

const roleDisplay: Record<UserRole, string> = {
  admin: 'Admin',
  wholesaler: 'Wholesaler',
  seller: 'Seller',
  pending: 'Pending'
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-500 text-white',
  wholesaler: 'bg-pakistani_green-600 text-white',
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

  if (!profile) return null;

  const canSwitch = profile.role === "seller" || profile.role === "wholesaler";
  const handleSwitch = async () => {
    if (!canSwitch) return;
    setIsSwitching(true);
    try {
      await changeRole(nextRole[profile.role as UserRole]);
      await checkAuthStatus();
    } catch(e) {
      //
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="flex items-center gap-1 relative ml-2">
      <Badge className={`capitalize px-2 py-1 text-xs font-poppins cursor-pointer transition ${roleColors[profile.role as UserRole]} flex items-center gap-1`}
        onClick={canSwitch ? handleSwitch : undefined}
        title={canSwitch ? `Switch to ${roleDisplay[nextRole[profile.role as UserRole]]}` : 'Role cannot be changed here'}
        style={canSwitch ? { cursor: 'pointer' } : { cursor: 'not-allowed' }}
      >
        {roleDisplay[profile.role as UserRole]}
        {canSwitch && !isSwitching && <ArrowDown className="w-3 h-3 ml-1" />}
        {isSwitching && <span className="ml-1 animate-spin">&#9696;</span>}
        {!canSwitch && <CheckCircle className="w-3 h-3 ml-1" />}
      </Badge>
    </div>
  );
};

export default RoleSwitcher;
