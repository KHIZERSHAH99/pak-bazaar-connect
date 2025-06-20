
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { signOut as authSignOut } from '@/lib/auth';
import type { Database } from '@/integrations/supabase/types';
import { Skeleton } from '@/components/ui/skeleton';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signOut: async () => {},
  checkAuthStatus: async () => {},
  refreshProfile: async () => null,
});

export const useAuth = () => useContext(AuthContext);

// Helper function to clean up auth state to prevent "limbo" states
const cleanupAuthState = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileFetchTimestamp, setProfileFetchTimestamp] = useState<number>(0);

  const fetchUserProfile = useCallback(async (userId: string, forceRefresh = false): Promise<Profile | null> => {
    try {
      // Cache profile data for 5 minutes to reduce redundant fetches
      const now = Date.now();
      if (!forceRefresh && profile && profileFetchTimestamp > 0 && now - profileFetchTimestamp < 300000) {
        return profile;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      setProfile(data as Profile);
      setProfileFetchTimestamp(now);
      return data as Profile;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }, [profile, profileFetchTimestamp]);

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (!user) return null;
    return fetchUserProfile(user.id, true);
  }, [user, fetchUserProfile]);

  const signOut = useCallback(async () => {
    try {
      await authSignOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      setProfileFetchTimestamp(0);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setUser(null);
        setSession(null);
        setProfile(null);
        return;
      }
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        
        // Only fetch profile if we don't have cached data
        const userProfile = await fetchUserProfile(currentSession.user.id);
        setProfile(userProfile);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event);
        
        // Update state synchronously
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        // Handle profile fetch for authenticated users
        if (currentSession?.user && event !== 'TOKEN_REFRESHED') {
          // Use setTimeout to prevent potential deadlocks
          setTimeout(() => {
            if (mounted) {
              fetchUserProfile(currentSession.user.id, event === 'SIGNED_IN');
            }
          }, 100);
        } else if (!currentSession) {
          setProfile(null);
          setProfileFetchTimestamp(0);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session only once
    checkAuthStatus();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to run only once

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      loading, 
      signOut,
      checkAuthStatus,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Loading screen component to use throughout the app
export const LoadingScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <div className="w-16 h-16 border-4 border-pakistani_green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
    <h3 className="text-lg font-medium text-gray-800 font-poppins">Loading...</h3>
    <p className="text-gray-500 text-sm mt-2 font-poppins">Please wait while we prepare your experience</p>
  </div>
);

// Skeleton loader for profile data
export const ProfileSkeleton: React.FC = () => (
  <div className="space-y-3">
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className="h-4 w-3/4" />
    <div className="pt-2">
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);
