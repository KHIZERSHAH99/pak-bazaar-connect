
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { changeRole, UserRole } from '@/lib/auth';

interface UseSmartRoleSwitchReturn {
  switchRole: (targetRole: UserRole) => Promise<void>;
  isRegisteredForRole: (role: UserRole) => boolean;
  isSwitching: boolean;
  canSwitchTo: (role: UserRole) => boolean;
}

export const useSmartRoleSwitch = (): UseSmartRoleSwitchReturn => {
  const { profile, checkAuthStatus } = useAuth();
  const { toast } = useToast();
  const [isSwitching, setIsSwitching] = useState(false);

  // Check if user is registered for a specific role
  const isRegisteredForRole = useCallback((role: UserRole): boolean => {
    if (!profile) return false;
    
    // User is registered for their current role
    if (profile.role === role) return true;
    
    // Admin can switch to any role
    if (profile.role === 'admin') return true;
    
    // For now, assume users can switch between seller and wholesaler
    // In a real implementation, you'd check against a registration table
    if (role === 'seller' || role === 'wholesaler') {
      return profile.role === 'seller' || profile.role === 'wholesaler';
    }
    
    return false;
  }, [profile]);

  // Check if user can switch to a specific role
  const canSwitchTo = useCallback((role: UserRole): boolean => {
    if (!profile) return false;
    if (profile.role === role) return false; // Can't switch to current role
    
    // Admin can't switch roles through normal flow
    if (profile.role === 'admin') return false;
    
    // Only allow switching between seller and wholesaler
    return (profile.role === 'seller' && role === 'wholesaler') ||
           (profile.role === 'wholesaler' && role === 'seller');
  }, [profile]);

  const switchRole = useCallback(async (targetRole: UserRole) => {
    if (!profile || isSwitching) return;

    // Check if user can switch to target role
    if (!canSwitchTo(targetRole)) {
      toast({
        title: "Cannot Switch Role",
        description: "Role switching is not available for your current account type.",
        variant: "destructive"
      });
      return;
    }

    setIsSwitching(true);

    try {
      // Check if user is registered for target role
      if (!isRegisteredForRole(targetRole)) {
        toast({
          title: "Registration Required",
          description: `You need to register as a ${targetRole} first. Redirecting to signup...`,
          variant: "default"
        });
        
        // Redirect to signup with role pre-selected
        setTimeout(() => {
          window.location.href = `/signup?role=${targetRole}`;
        }, 2000);
        return;
      }

      // Perform role switch
      await changeRole(targetRole);
      
      toast({
        title: "Role Switch Successful",
        description: `Successfully switched to ${targetRole}. Reloading page...`,
        variant: "default"
      });

      // Force page reload after successful role switch
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      console.error('Role switch error:', error);
      
      let errorMessage = "Failed to switch role. Please try again.";
      
      if (error.message?.includes('pending')) {
        errorMessage = "Your role change request is pending admin approval.";
      } else if (error.message?.includes('not authorized')) {
        errorMessage = "You are not authorized to switch to this role.";
      }
      
      toast({
        title: "Role Switch Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      setIsSwitching(false);
    }
  }, [profile, isSwitching, canSwitchTo, isRegisteredForRole, toast]);

  return {
    switchRole,
    isRegisteredForRole,
    isSwitching,
    canSwitchTo
  };
};
