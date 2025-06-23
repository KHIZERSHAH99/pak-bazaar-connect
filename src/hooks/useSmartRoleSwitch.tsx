
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

  // Check if user can switch to a specific role
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

    console.log('🔄 Secure role switch attempt:', { currentRole: profile.role, targetRole });

    // Validate target role
    if (!['seller', 'wholesaler'].includes(targetRole)) {
      toast({
        title: "Cannot switch role",
        description: "Unauthorized access",
        variant: "destructive"
      });
      return;
    }

    // Check if user can switch to target role
    if (!canSwitchTo(targetRole)) {
      let message = "Unauthorized access";
      
      if (profile.role === 'pending') {
        message = "Verification pending";
      } else if (profile.role === targetRole) {
        message = `You are already a ${targetRole}`;
      } else {
        message = "Unauthorized access";
      }
      
      toast({
        title: "Cannot switch role",
        description: message,
        variant: "destructive"
      });
      return;
    }

    setIsSwitching(true);

    try {
      // Show loading state
      toast({
        title: "Switching role",
        description: `Switching to ${targetRole}...`,
        variant: "default"
      });

      console.log('🔄 Calling role switch function');

      // Use the existing switch_business_role function
      const { data: functionResult, error: functionError } = await supabase.rpc('switch_business_role', {
        target_role: targetRole
      });

      if (functionError) {
        console.error('Role switch error:', functionError);
        throw functionError;
      }

      // Type cast the response data
      const response = functionResult as unknown as RoleSwitchResponse;

      if (!response?.success) {
        throw new Error(response?.error || 'Role switch failed');
      }
      
      console.log('✅ Role switch successful');
      
      // Refresh auth status
      await checkAuthStatus();
      
      toast({
        title: "Role switched successfully",
        description: `You are now a ${targetRole}`,
        variant: "default"
      });

      // Refresh the page after a short delay to show updated state
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      console.error('Role switch error:', error);
      
      let errorMessage = "Please try again";
      
      if (error.message) {
        if (error.message.includes('Already in target role')) {
          errorMessage = `You are already a ${targetRole}`;
        } else if (error.message.includes('not authenticated') || error.message.includes('unauthorized')) {
          errorMessage = "Unauthorized access";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error";
        } else if (error.message.includes('Maximum role switches')) {
          errorMessage = 'Maximum role switches per day exceeded. Please try again tomorrow.';
        } else if (error.message.includes('Cannot switch to seller while you have an active shop')) {
          errorMessage = 'Cannot switch to seller while you have an active shop. Please contact support if needed.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Role switch failed",
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
