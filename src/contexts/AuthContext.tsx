
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, Profile, getCurrentUser, getUserProfile } from '@/lib/supabase';

interface AuthState {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  checkAuthStatus: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        
        // Get user profile with role information
        const userProfile = await getUserProfile();
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // First check initial auth status
    checkAuthStatus();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const userProfile = await getUserProfile();
        setProfile(userProfile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
