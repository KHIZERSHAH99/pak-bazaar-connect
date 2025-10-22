import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { authenticateUser, registerUser, signOutUser } from '@/lib/auth/consolidated';
import { getUserProfile } from '@/lib/auth/profile';
import { ensureProfileSync } from '@/lib/auth/profile-sync';
import { UserRole } from '@/lib/types';
import { authSecurityManager } from '@/lib/security/enhanced-auth-security';

export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'wholesaler' | 'seller' | 'pending';
  created_at?: string;
  updated_at?: string;
  phone_number?: string;
  normalized_phone?: string;
  business_name?: string;
  contact_name?: string;
  business_type?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  industry?: string;
  years_in_business?: string;
  verification_status?: string;
  is_suspended?: boolean;
  suspension_reason?: string;
  
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (phoneOrEmail: string, password: string) => Promise<{ error?: string }>;
  signUp: (phoneOrEmail: string, password: string, role: string, businessData?: Record<string, any>) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const profileData = await getUserProfile();
      setProfile(profileData as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  // State to trigger profile fetch
  const [profileTrigger, setProfileTrigger] = useState<{ userId: string; email: string; metadata: any } | null>(null);

  // Initialize auth state with retry logic
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    // Exponential backoff retry for session refresh
    const retryWithBackoff = async (attemptFn: () => Promise<any>, attempt: number = 0): Promise<any> => {
      try {
        return await attemptFn();
      } catch (error: any) {
        if (attempt < maxRetries && (error.message?.includes('Failed to fetch') || error.message?.includes('network'))) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.log(`Retrying session fetch in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return retryWithBackoff(attemptFn, attempt + 1);
        }
        throw error;
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Trigger profile fetch via state update (avoids deadlock)
          setProfileTrigger({
            userId: session.user.id,
            email: session.user.email || '',
            metadata: session.user.user_metadata
          });
        } else {
          setProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session with retry logic
    retryWithBackoff(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Ensure profile sync
        await ensureProfileSync(session.user.id, session.user.email || '', session.user.user_metadata);
        await fetchProfile(session.user.id);
      }
      
      setLoading(false);
    }).catch(error => {
      console.error('Failed to initialize auth after retries:', error);
      if (mounted) {
        setLoading(false);
        toast({
          title: "Connection Issue",
          description: "Having trouble connecting. Please refresh the page.",
          variant: "destructive"
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  // Separate effect for profile fetching (prevents deadlock)
  useEffect(() => {
    if (profileTrigger) {
      const syncAndFetch = async () => {
        await ensureProfileSync(profileTrigger.userId, profileTrigger.email, profileTrigger.metadata);
        await fetchProfile(profileTrigger.userId);
      };
      syncAndFetch();
    }
  }, [profileTrigger]);

  // Auth methods
  const handleSignIn = async (phoneOrEmail: string, password: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      
      // Security validation before attempting login
      const securityCheck = await authSecurityManager.enforceSecureLogin(phoneOrEmail, password);
      if (!securityCheck.allowed) {
        throw new Error(securityCheck.message || 'Sign in blocked for security reasons');
      }
      
      await authenticateUser(phoneOrEmail, password);
      
      // Record successful login
      await authSecurityManager.recordAuthAttempt(phoneOrEmail, true);
      
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      
      return {};
    } catch (error: any) {
      const errorMessage = error.message || 'Sign in failed';
      
      // Record failed login attempt
      await authSecurityManager.recordAuthAttempt(phoneOrEmail, false);
      
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (
    phoneOrEmail: string, 
    password: string, 
    role: string, 
    businessData?: Record<string, any>
  ): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      await registerUser(phoneOrEmail, password, role as UserRole, businessData || {});
      
      toast({
        title: "Account Created",
        description: "Welcome to Pak Bazaar Connect!",
      });
      
      return {};
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await signOutUser();
      
      // Note: signOutUser handles page reload, so these may not execute
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      
      toast({
        title: "Sign Out Error",
        description: "There was an issue signing out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      const profileData = await getUserProfile();
      setProfile(profileData as Profile);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};