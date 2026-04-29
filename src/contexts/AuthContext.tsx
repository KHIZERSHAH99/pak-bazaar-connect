import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { signIn, signUp, signOut } from '@/lib/auth';
import { getUserProfile } from '@/lib/auth/profile';
import { ensureProfileSync } from '@/lib/auth/profile-sync';
import { UserRole } from '@/lib/types';
import { authSecurityManager } from '@/lib/security/enhanced-auth-security';
import { cacheManager } from '@/lib/performance/cache-manager';
import { CSRFProtection } from '@/lib/security/csrf-protection';

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

// Session validation interval (5 minutes)
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const profileFetchedRef = React.useRef(false);

  // Clear all client-side cached state
  const clearAllClientState = () => {
    cacheManager.clear();
    CSRFProtection.clearToken();
    profileFetchedRef.current = false;
  };

  // Fetch user profile with JWT expiry handling
  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setProfile(null);
        return;
      }
      
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      
      if (expiresAt < Date.now()) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          toast({
            title: "Session Expired",
            description: "Please sign in again",
            variant: "destructive"
          });
          await supabase.auth.signOut();
          setProfile(null);
          return;
        }
      }
      
      const profileData = await getUserProfile();
      setProfile(profileData as Profile);
      profileFetchedRef.current = true;
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Error fetching profile:', error);
      
      if (error?.code === 'PGRST301' && retryCount === 0) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (!refreshError && refreshData.session) {
          return fetchProfile(userId, retryCount + 1);
        } else {
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

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let sessionCheckTimer: ReturnType<typeof setInterval> | null = null;
    let isRefreshing = false; // Prevent concurrent refresh attempts

    const setupSessionRefresh = (sess: Session) => {
      // Always clear previous timer to prevent accumulation
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
      }

      const expiresAt = sess.expires_at ? sess.expires_at * 1000 : 0;
      const timeUntilExpiry = expiresAt - Date.now();
      const refreshTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);

      if (refreshTime > 0) {
        refreshTimer = setTimeout(async () => {
          // Skip if already refreshing or component unmounted
          if (isRefreshing || !mounted) return;

          isRefreshing = true;
          try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
              if (import.meta.env.DEV) console.error('Session refresh failed:', error);
              if (mounted) await supabase.auth.signOut();
            } else if (data.session && mounted) {
              setupSessionRefresh(data.session);
            }
          } catch (err) {
            if (import.meta.env.DEV) console.error('Session refresh error:', err);
          } finally {
            isRefreshing = false;
          }
        }, refreshTime);
      }
    };

    // Periodic session integrity check — validates session server-side
    const startSessionIntegrityCheck = () => {
      if (sessionCheckTimer) clearInterval(sessionCheckTimer);
      sessionCheckTimer = setInterval(() => {
        if (!mounted) return;
        // Wrap async operations in IIFE to avoid deadlock
        (async () => {
          try {
            const { data: { session: currentSession }, error } = await supabase.auth.getSession();
            if (error || !currentSession) {
              if (mounted) {
                setUser(null);
                setSession(null);
                setProfile(null);
                clearAllClientState();
              }
              return;
            }
            // Verify the session is still valid by making a lightweight authenticated call
            const { error: verifyError } = await supabase.auth.getUser();
            if (verifyError) {
              if (import.meta.env.DEV) console.warn('Session integrity check failed:', verifyError.message);
              await supabase.auth.signOut();
              if (mounted) {
                setUser(null);
                setSession(null);
                setProfile(null);
                clearAllClientState();
              }
            }
          } catch {
            // Silently fail — network issues shouldn't force logout
          }
        })();
      }, SESSION_CHECK_INTERVAL);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, sess) => {
        if (!mounted) return;

        // Wrap async operations in IIFE to avoid deadlock
        (async () => {
          try {
            if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
              if (sess) setupSessionRefresh(sess);
            }

            setSession(sess);
            setUser(sess?.user ?? null);

            if (sess?.user && event === 'SIGNED_IN' && !profileFetchedRef.current) {
              startSessionIntegrityCheck();
              await ensureProfileSync(sess.user.id, sess.user.email || '', sess.user.user_metadata);
              await fetchProfile(sess.user.id);
            } else if (event === 'SIGNED_OUT') {
              setProfile(null);
              clearAllClientState();
              if (refreshTimer) clearTimeout(refreshTimer);
              if (sessionCheckTimer) clearInterval(sessionCheckTimer);
            }

            if (mounted) setLoading(false);
          } catch (error) {
            console.error('Auth state change error:', error);
            if (mounted) setLoading(false);
          }
        })();
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      if (!mounted) return;
      
      setSession(sess);
      setUser(sess?.user ?? null);
      
      if (sess?.user) {
        setupSessionRefresh(sess);
        startSessionIntegrityCheck();
        if (!profileFetchedRef.current) {
          ensureProfileSync(sess.user.id, sess.user.email || '', sess.user.user_metadata).then(() => {
            fetchProfile(sess.user.id);
          });
        }
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      // Ensure all timers are properly cleared
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
      }
      if (sessionCheckTimer) {
        clearInterval(sessionCheckTimer);
        sessionCheckTimer = null;
      }
      subscription.unsubscribe();
    };
  }, []);

  // Auth methods
  const handleSignIn = async (phoneOrEmail: string, password: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);

      const securityCheck = await authSecurityManager.enforceSecureLogin(phoneOrEmail, password);
      if (!securityCheck.allowed) {
        throw new Error(securityCheck.message || 'Sign in blocked for security reasons');
      }

      await signIn(phoneOrEmail, password);
      await authSecurityManager.recordAuthAttempt(phoneOrEmail, true);

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });

      return {};
    } catch (error: any) {
      const errorMessage = error.message || 'Sign in failed';
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
      await signUp(phoneOrEmail, password, role as UserRole, businessData || {});

      toast({
        title: "Account Created",
        description: "Welcome to PakMandi!",
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

      // Clear all client state before sign out
      clearAllClientState();

      await signOut();

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
