
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextEnhanced';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

interface UseSmartRoleSwitchReturn {
  switchRole: (targetRole: UserRole) => Promise<void>;
  isRegisteredForRole: (role: UserRole) => boolean;
  isSwitching: boolean;
  canSwitchTo: (role: UserRole) => boolean;
}

export const useSmartRoleSwitchEnhanced = (): UseSmartRoleSwitchReturn => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isSwitching, setIsSwitching] = useState(false);

  const isRegisteredForRole = useCallback((role: UserRole): boolean => {
    if (!profile) return false;
    
    if (profile.role === role) return true;
    if (profile.role === 'admin') return true;
    
    if (role === 'seller' || role === 'wholesaler') {
      return profile.role === 'seller' || profile.role === 'wholesaler' || profile.role === 'admin';
    }
    
    return false;
  }, [profile]);

  const canSwitchTo = useCallback((role: UserRole): boolean => {
    if (!profile) return false;
    if (profile.role === role) return false;
    
    // Don't allow switching to admin or pending
    if (role === 'admin' || role === 'pending') return false;
    
    if (!['seller', 'wholesaler'].includes(role)) return false;
    
    if ((profile.role === 'seller' || profile.role === 'wholesaler') && 
        (role === 'seller' || role === 'wholesaler')) {
      return true;
    }
    
    if (profile.role === 'admin' && (role === 'seller' || role === 'wholesaler')) {
      return true;
    }
    
    return false;
  }, [profile]);

  const switchRole = useCallback(async (targetRole: UserRole) => {
    if (!profile || isSwitching) return;

    console.log('🔄 Enhanced role switch attempt:', { currentRole: profile.role, targetRole });

    if (!['seller', 'wholesaler'].includes(targetRole)) {
      toast({
        title: 'Cannot switch role',
        description: 'Invalid role selected',
        variant: "destructive"
      });
      return;
    }

    if (!canSwitchTo(targetRole)) {
      toast({
        title: 'Cannot switch role',
        description: 'You are not authorized to switch to this role',
        variant: "destructive"
      });
      return;
    }

    setIsSwitching(true);

    try {
      toast({
        title: 'Switching role...',
        description: `Switching to ${targetRole}...`,
        variant: "default"
      });

      const { data: functionResult, error: functionError } = await supabase.rpc('switch_business_role', {
        target_role: targetRole
      });

      if (functionError) {
        console.error('Role switch error:', functionError);
        throw functionError;
      }

      const response = functionResult as unknown as { success: boolean; error?: string };

      if (!response?.success) {
        throw new Error(response?.error || 'Role switch failed');
      }
      
      console.log('✅ Enhanced role switch successful');
      
      await refreshProfile();
      
      toast({
        title: 'Role switched successfully',
        description: `You are now a ${targetRole}`,
        variant: "default"
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      console.error('Enhanced role switch error:', error);
      
      let errorMessage = 'Please try again';
      
      if (error.message) {
        if (error.message.includes('Already in target role')) {
          errorMessage = `You are already a ${targetRole}`;
        } else if (error.message.includes('not authenticated') || error.message.includes('unauthorized')) {
          errorMessage = 'You are not authorized to perform this action';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Role switch failed',
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSwitching(false);
    }
  }, [profile, isSwitching, canSwitchTo, toast, refreshProfile]);

  return {
    switchRole,
    isRegisteredForRole,
    isSwitching,
    canSwitchTo
  };
};
