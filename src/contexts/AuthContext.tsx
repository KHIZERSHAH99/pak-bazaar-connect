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

  // Fetch user profile with JWT expiry handling
  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      // Check if session is expired before fetching
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session');
        setProfile(null);
        return;
      }
      
      // Check if JWT is expired
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      
      if (expiresAt < now) {
        console.log('JWT expired, refreshing session...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error('Session refresh failed:', refreshError);
          toast({
            title: "Session Expired",
            description: "Please sign in again",
            variant: "destructive"
          });
          await supabase.auth.signOut();
          setProfile(null);
          return;
        }
        
        console.log('Session refreshed successfully');
      }
      
      const profileData = await getUserProfile();
      setProfile(profileData as Profile);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      
      // Handle JWT expired error
      if (error?.code === 'PGRST301' && retryCount === 0) {
        console.log('JWT expired error detected, attempting refresh...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (!refreshError && refreshData.session) {
          // Retry fetching profile after refresh
          return fetchProfile(userId, retryCount + 1);
        } else {
          console.error('Failed to refresh session:', refreshError);
          toast({
            title: "Session Expired",
            description: "Please sign in again",
            variant: "destructive"
          });
          await supabase.auth.signOut();
        }
      }
      
      setProfile(null);
    }
  };

  // State to trigger profile fetch
  const [profileTrigger, setProfileTrigger] = useState<{ userId: string; email: string; metadata: any } | null>(null);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let refreshTimer: NodeJS.Timeout | null = null;

    // Auto-refresh session before expiry
    const setupSessionRefresh = (session: Session) => {
      if (refreshTimer) clearTimeout(refreshTimer);
      
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // Refresh 5 minutes before expiry
      const refreshTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);
      
      if (refreshTime > 0) {
        refreshTimer = setTimeout(async () => {
          try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
              console.error('Session refresh failed:', error);
              // Force re-login if refresh fails
              await supabase.auth.signOut();
            } else if (data.session) {
              setupSessionRefresh(data.session);
            }
          } catch (err) {
            console.error('Session refresh error:', err);
          }
        }, refreshTime);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        
        // Handle JWT expired
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          if (session) {
            setupSessionRefresh(session);
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Trigger profile fetch via state update (avoids deadlock)
          setProfileTrigger({
            userId: session.user.id,
            email: session.user.email || '',
            metadata: session.user.user_metadata
          });
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          if (refreshTimer) clearTimeout(refreshTimer);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setupSessionRefresh(session);
        // Ensure profile sync
        ensureProfileSync(session.user.id, session.user.email || '', session.user.user_metadata).then(() => {
          fetchProfile(session.user.id);
        });
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      if (refreshTimer) clearTimeout(refreshTimer);
      subscription.unsubscribe();
    };
  }, []);

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