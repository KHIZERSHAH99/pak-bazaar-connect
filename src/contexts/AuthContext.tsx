
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  checkAuthStatus: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Add profile cache to prevent redundant fetches
  const [profileFetchTimestamp, setProfileFetchTimestamp] = useState<number>(0);

  const fetchUserProfile = async (userId: string, forceRefresh = false) => {
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
      
      setProfileFetchTimestamp(now);
      return data as Profile;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  };

  const checkAuthStatus = async () => {
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
  };

  useEffect(() => {
    // Optimization: Only run auth check once on mount
    let mounted = true;

    // First set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        if (!mounted) return;
        
        // Update state synchronously here 
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        // Fetch user profile when auth state changes but optimize to avoid redundant fetches
        if (currentSession?.user) {
          const userProfile = await fetchUserProfile(currentSession.user.id, event === 'SIGNED_IN');
          if (mounted) {
            setProfile(userProfile);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    checkAuthStatus();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
