
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, UserPlus, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSmartRoleSwitch } from '@/hooks/useSmartRoleSwitch';
import { UserRole } from '@/lib/types';

const roleDisplay: Record<UserRole, string> = {
  admin: 'Admin',
  wholesaler: 'Wholesaler',
  seller: 'Seller',
  pending: 'Pending'
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-600 text-white hover:bg-red-700',
  wholesaler: 'bg-pakistani_green-700 text-white hover:bg-pakistani_green-800',
  seller: 'bg-blue-600 text-white hover:bg-blue-700',
  pending: 'bg-gray-400 text-white hover:bg-gray-500'
};

const nextRole: Record<UserRole, UserRole> = {
  seller: 'wholesaler',
  wholesaler: 'seller',
  admin: 'admin',
  pending: 'seller'
};

const SmartRoleSwitcher: React.FC = () => {
  const { profile } = useAuth();
  const { switchRole, isRegisteredForRole, isSwitching, canSwitchTo } = useSmartRoleSwitch();

  if (!profile) return null;

  const currentRole = profile.role as UserRole;
  const targetRole = nextRole[currentRole];
  const canSwitch = canSwitchTo(targetRole);
  const isRegistered = isRegisteredForRole(targetRole);

  const handleAction = async () => {
    if (canSwitch) {
      await switchRole(targetRole);
    }
  };

  const getButtonText = () => {
    if (isSwitching) return "Switching...";
    if (!canSwitch) return "Role Fixed";
    if (!isRegistered) return `Sign up as ${roleDisplay[targetRole]}`;
    return `Switch to ${roleDisplay[targetRole]}`;
  };

  const getButtonIcon = () => {
    if (isSwitching) return <RefreshCw className="w-3 h-3 mr-1 animate-spin" />;
    if (!canSwitch) return <CheckCircle className="w-3 h-3 mr-1" />;
    if (!isRegistered) return <UserPlus className="w-3 h-3 mr-1" />;
    return <RefreshCw className="w-3 h-3 mr-1" />;
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Current Role Badge */}
      <Badge 
        className={`px-3 py-1 text-xs font-medium font-poppins transition-all duration-200 ${roleColors[currentRole]}`}
      >
        {roleDisplay[currentRole]}
      </Badge>

      {/* Action Button */}
      {(canSwitch || !isRegistered) && (
        <Button
          onClick={handleAction}
          disabled={isSwitching}
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs font-poppins border-gray-300 hover:border-pakistani_green-400 hover:text-pakistani_green-700 transition-all duration-200 disabled:opacity-50"
        >
          {getButtonIcon()}
          {getButtonText()}
        </Button>
      )}

      {/* Status Indicator */}
      {!canSwitch && currentRole !== 'admin' && (
        <div className="text-xs text-gray-500 font-poppins">
          Contact admin to change role
        </div>
      )}
    </div>
  );
};

export default SmartRoleSwitcher;
