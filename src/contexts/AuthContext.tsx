
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Skeleton } from '@/components/ui/skeleton';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  checkAuthStatus: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  checkAuthStatus: async () => {},
  refreshProfile: async () => null,
});

export const useAuth = () => useContext(AuthContext);

// Helper function to clean up auth state to prevent "limbo" states
const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
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
  // Add profile cache to prevent redundant fetches
  const [profileFetchTimestamp, setProfileFetchTimestamp] = useState<number>(0);

  const fetchUserProfile = useCallback(async (userId: string, forceRefresh = false): Promise<Profile | null> => {
    try {
      // Cache profile data for 5 minutes to reduce redundant fetches
      const now = Date.now();
      if (!forceRefresh && profile && profileFetchTimestamp > 0 && now - profileFetchTimestamp < 300000) {
        console.log('Using cached profile data');
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

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current session
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setUser(null);
        setSession(null);
        setProfile(null);
        return;
      }
      
      if (currentSession) {
        console.log('Found existing session:', currentSession.user.email);
        setSession(currentSession);
        setUser(currentSession.user);
        
        // Get user profile with role information
        const userProfile = await fetchUserProfile(currentSession.user.id);
        setProfile(userProfile);
      } else {
        console.log('No session found');
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
    // First set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        // Update state synchronously here
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        // Fetch user profile when auth state changes but optimize to avoid redundant fetches
        if (currentSession?.user) {
          // Use setTimeout to prevent potential deadlocks
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id, event === 'SIGNED_IN');
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    checkAuthStatus();

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuthStatus, fetchUserProfile]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      loading, 
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
    <h3 className="text-lg font-medium text-gray-800">Loading...</h3>
    <p className="text-gray-500 text-sm mt-2">Please wait while we prepare your experience</p>
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
