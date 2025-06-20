
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
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

    console.log('🔄 Role switch attempt:', { currentRole: profile.role, targetRole });

    // Validate target role
    if (!['seller', 'wholesaler'].includes(targetRole)) {
      toast({
        title: t('cannot_switch_role'),
        description: t('unauthorized_access'),
        variant: "destructive"
      });
      return;
    }

    // Check if user can switch to target role
    if (!canSwitchTo(targetRole)) {
      let message = t('unauthorized_access');
      
      if (profile.role === 'pending') {
        message = t('verification_pending');
      } else if (profile.role === targetRole) {
        message = `${t('current')} ${t(targetRole)}`;
      } else {
        message = t('unauthorized_access');
      }
      
      toast({
        title: t('cannot_switch_role'),
        description: message,
        variant: "destructive"
      });
      return;
    }

    setIsSwitching(true);

    try {
      // Show loading state
      toast({
        title: t('switching_role'),
        description: `${t('switching_role')} ${t(targetRole)}...`,
        variant: "default"
      });

      console.log('🔄 Calling switch_business_role function');

      // First check if the function exists
      const { data: functionExists, error: checkError } = await supabase.rpc('switch_business_role', {
        target_role: targetRole
      });

      if (checkError) {
        console.error('Function check error:', checkError);
        
        // If function doesn't exist, do direct profile update
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: targetRole })
          .eq('id', user.id);

        if (updateError) {
          console.error('Direct update error:', updateError);
          throw updateError;
        }

        console.log('✅ Direct role update successful');
      } else {
        // Type cast the response data with proper conversion
        const response = functionExists as unknown as RoleSwitchResponse;

        if (!response?.success) {
          throw new Error(response?.error || 'Role switch failed');
        }
        
        console.log('✅ Function-based role switch successful');
      }
      
      // Refresh auth status
      await checkAuthStatus();
      
      toast({
        title: t('role_switched_successfully'),
        description: `${t('current')} ${t(targetRole)}`,
        variant: "default"
      });

      // Refresh the page after a short delay to show updated state
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      console.error('Role switch error:', error);
      
      let errorMessage = t('try_again');
      
      if (error.message) {
        if (error.message.includes('Already in target role')) {
          errorMessage = `${t('current')} ${t(targetRole)}`;
        } else if (error.message.includes('not authenticated') || error.message.includes('unauthorized')) {
          errorMessage = t('unauthorized_access');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = t('network_error');
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: t('role_switch_failed'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSwitching(false);
    }
  }, [profile, isSwitching, canSwitchTo, toast, checkAuthStatus, t]);

  return {
    switchRole,
    isRegisteredForRole,
    isSwitching,
    canSwitchTo
  };
};
