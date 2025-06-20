
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';
import { RoleSwitchResponse } from '@/types/role-switch';

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
    
    // For seller and wholesaler, they can switch between each other
    if (role === 'seller' || role === 'wholesaler') {
      return profile.role === 'seller' || profile.role === 'wholesaler' || profile.role === 'admin';
    }
    
    return false;
  }, [profile]);

  // Check if user can switch to a specific role - fixed logic
  const canSwitchTo = useCallback((role: UserRole): boolean => {
    if (!profile) return false;
    if (profile.role === role) return false; // Can't switch to current role
    
    // Only allow switching for business roles (seller/wholesaler)
    if (!['seller', 'wholesaler'].includes(role)) return false;
    
    // Allow switching between seller and wholesaler
    if ((profile.role === 'seller' || profile.role === 'wholesaler') && 
        (role === 'seller' || role === 'wholesaler')) {
      return true;
    }
    
    // Admin can switch to any business role for testing purposes
    if (profile.role === 'admin' && (role === 'seller' || role === 'wholesaler')) {
      return true;
    }
    
    return false;
  }, [profile]);

  const switchRole = useCallback(async (targetRole: UserRole) => {
    if (!profile || isSwitching) return;

    console.log('🔄 Role switch attempt:', { currentRole: profile.role, targetRole });

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
      let message = "Role switching is not available.";
      
      if (profile.role === 'pending') {
        message = "Please wait for admin approval before switching roles.";
      } else if (profile.role === targetRole) {
        message = `You are already a ${targetRole}.`;
      } else {
        message = "Role switching is only available between seller and wholesaler roles.";
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
      // Show loading state
      toast({
        title: "Switching Role",
        description: `Switching to ${targetRole} role...`,
        variant: "default"
      });

      console.log('🔄 Calling switch_business_role function');

      // Call the database function for direct role switching
      const { data, error } = await supabase.rpc('switch_business_role', {
        target_role: targetRole
      });

      console.log('🔄 Function response:', { data, error });

      if (error) {
        console.error('Role switch error:', error);
        throw error;
      }

      // Type cast the response data with proper conversion
      const response = data as unknown as RoleSwitchResponse;

      if (!response.success) {
        throw new Error(response.error || 'Role switch failed');
      }
      
      console.log('✅ Role switch successful');
      
      // Refresh auth status
      await checkAuthStatus();
      
      toast({
        title: "Role Switched Successfully!",
        description: `You are now a ${targetRole}. Welcome to your new role!`,
        variant: "default"
      });

      // Refresh the page after a short delay to show updated state
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      console.error('Role switch error:', error);
      
      let errorMessage = "Failed to switch role. Please try again.";
      
      if (error.message) {
        if (error.message.includes('Already in target role')) {
          errorMessage = `You are already a ${targetRole}.`;
        } else if (error.message.includes('not authenticated') || error.message.includes('unauthorized')) {
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
  }, [profile, isSwitching, canSwitchTo, toast, checkAuthStatus]);

  return {
    switchRole,
    isRegisteredForRole,
    isSwitching,
    canSwitchTo
  };
};
