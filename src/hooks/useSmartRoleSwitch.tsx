
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { secureChangeRole, UserRole } from '@/lib/auth-enhanced';

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
    
    // Admin can access any role
    if (profile.role === 'admin') return true;
    
    // For this implementation, assume users can switch between seller and wholesaler
    // In a real implementation, you'd check against a registration/verification table
    if (role === 'seller' || role === 'wholesaler') {
      return profile.role === 'seller' || profile.role === 'wholesaler' || profile.role === 'admin';
    }
    
    return false;
  }, [profile]);

  // Check if user can switch to a specific role
  const canSwitchTo = useCallback((role: UserRole): boolean => {
    if (!profile) return false;
    if (profile.role === role) return false; // Can't switch to current role
    
    // Admin can't switch roles through normal flow (they have permanent access)
    if (profile.role === 'admin') return false;
    
    // Pending users can't switch until their role is approved
    if (profile.role === 'pending') return false;
    
    // Only allow switching between seller and wholesaler
    return (profile.role === 'seller' && role === 'wholesaler') ||
           (profile.role === 'wholesaler' && role === 'seller');
  }, [profile]);

  const switchRole = useCallback(async (targetRole: UserRole) => {
    if (!profile || isSwitching) return;

    // Validate target role
    if (!['seller', 'wholesaler'].includes(targetRole)) {
      toast({
        title: "Invalid Role",
        description: "Invalid role specified for switching.",
        variant: "destructive"
      });
      return;
    }

    // Check if user can switch to target role
    if (!canSwitchTo(targetRole)) {
      let message = "Role switching is not available for your current account type.";
      
      if (profile.role === 'admin') {
        message = "Admin accounts have access to all features without role switching.";
      } else if (profile.role === 'pending') {
        message = "Please wait for admin approval before switching roles.";
      } else if (profile.role === targetRole) {
        message = `You are already a ${targetRole}.`;
      }
      
      toast({
        title: "Cannot Switch Role",
        description: message,
        variant: "destructive"
      });
      return;
    }

    setIsSwitching(true);

    try {
      // Check if user needs to register for target role
      if (!isRegisteredForRole(targetRole)) {
        toast({
          title: "Registration Required",
          description: `You need to complete ${targetRole} registration. Redirecting...`,
          variant: "default"
        });
        
        // Redirect to signup with role pre-selected
        setTimeout(() => {
          window.location.href = `/signup?role=${targetRole}`;
        }, 2000);
        return;
      }

      // Show loading state
      toast({
        title: "Switching Role",
        description: `Switching to ${targetRole} role...`,
        variant: "default"
      });

      // Perform role switch - this creates a role request for admin approval
      await secureChangeRole(targetRole);
      
      // Refresh auth status
      await checkAuthStatus();
      
      toast({
        title: "Role Switch Requested",
        description: `Your request to switch to ${targetRole} has been submitted for admin approval.`,
        variant: "default"
      });

      // Refresh the page after a short delay to show updated state
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Role switch error:', error);
      
      let errorMessage = "Failed to switch role. Please try again.";
      
      if (error.message) {
        if (error.message.includes('pending')) {
          errorMessage = "Your role change request is pending admin approval.";
        } else if (error.message.includes('not authorized') || error.message.includes('unauthorized')) {
          errorMessage = "You are not authorized to switch to this role.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Role Switch Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSwitching(false);
    }
  }, [profile, isSwitching, canSwitchTo, isRegisteredForRole, toast, checkAuthStatus]);

  return {
    switchRole,
    isRegisteredForRole,
    isSwitching,
    canSwitchTo
  };
};
