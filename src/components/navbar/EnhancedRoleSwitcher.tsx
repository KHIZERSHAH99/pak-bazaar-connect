
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
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

const EnhancedRoleSwitcher: React.FC = () => {
  const { profile, checkAuthStatus } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);
  const { toast } = useToast();

  if (!profile) return null;

  const canSwitch = profile.role === "seller" || profile.role === "wholesaler";
  const currentRole = profile.role as UserRole;
  const targetRole = nextRole[currentRole];

  const handleSwitch = async () => {
    if (!canSwitch || isSwitching) return;
    
    setIsSwitching(true);
    try {
      await changeRole(targetRole);
      await checkAuthStatus();
      toast({
        title: "Role Switched Successfully",
        description: `You are now operating as a ${roleDisplay[targetRole]}.`,
        variant: "default"
      });
    } catch(error: any) {
      console.error('Role switch error:', error);
      toast({
        title: "Failed to Switch Role",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Current Role Badge */}
      <Badge 
        className={`px-3 py-1 text-xs font-medium font-poppins transition-all duration-200 ${roleColors[currentRole]}`}
      >
        {roleDisplay[currentRole]}
      </Badge>

      {/* Switch Button */}
      {canSwitch && (
        <Button
          onClick={handleSwitch}
          disabled={isSwitching}
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs font-poppins border-gray-300 hover:border-pakistani_green-400 hover:text-pakistani_green-700 transition-all duration-200"
        >
          {isSwitching ? (
            <>
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Switching...
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3 mr-1" />
              Switch to {roleDisplay[targetRole]}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default EnhancedRoleSwitcher;
