
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole, validateProfile } from '@/lib/types';
import { getEnhancedUserProfile, updateEnhancedUserProfile } from '@/lib/supabase-enhanced';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, role: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pakistani_green-700 mx-auto mb-4"></div>
      <p className="text-gray-600 font-poppins">Loading...</p>
    </div>
  </div>
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Use refs to prevent unnecessary re-renders and API calls
  const profileCache = useRef<Map<string, { profile: Profile; timestamp: number }>>(new Map());
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);
  const isRefreshing = useRef(false);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const refreshProfile = useCallback(async () => {
    if (!user || isRefreshing.current) {
      setProfile(null);
      return;
    }

    // Check cache first
    const cached = profileCache.current.get(user.id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setProfile(cached.profile);
      return;
    }

    isRefreshing.current = true;

    try {
      const profileData = await getEnhancedUserProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        // Cache the profile
        profileCache.current.set(user.id, {
          profile: profileData,
          timestamp: Date.now()
        });
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setProfile(null);
    } finally {
      isRefreshing.current = false;
    }
  }, [user]);

  const debouncedRefreshProfile = useCallback(() => {
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
    }
    refreshTimeout.current = setTimeout(refreshProfile, 100);
  }, [refreshProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) throw error;

      toast({
        title: 'Welcome back!',
        description: 'You have been successfully logged in.'
      });

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: 'Sign in failed',
        description: error.message || 'Failed to sign in. Please try again.',
        variant: 'destructive'
      });
      return { error: error.message };
    }
  }, [toast]);

  const signUp = useCallback(async (email: string, password: string, role: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { role }
        }
      });

      if (error) throw error;

      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.'
      });

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: 'Sign up failed',
        description: error.message || 'Failed to create account. Please try again.',
        variant: 'destructive'
      });
      return { error: error.message };
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setProfile(null);
      profileCache.current.clear();

      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.'
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: 'Sign out failed',
        description: error.message || 'Failed to sign out. Please try again.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await updateEnhancedUserProfile(user.id, updates);

      if (error) throw new Error(error);

      setProfile(data);
      // Update cache
      if (data) {
        profileCache.current.set(user.id, {
          profile: data,
          timestamp: Date.now()
        });
      }
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.'
      });

      return { error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
      return { error: error.message };
    }
  }, [user, toast]);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Debounce profile loading to prevent excessive calls
          debouncedRefreshProfile();
        } else {
          setProfile(null);
          profileCache.current.clear();
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, [debouncedRefreshProfile]);

  // Load profile when user changes (only if not already cached)
  useEffect(() => {
    if (user && !profile && !isRefreshing.current) {
      const cached = profileCache.current.get(user.id);
      if (!cached || Date.now() - cached.timestamp >= CACHE_DURATION) {
        refreshProfile();
      }
    }
  }, [user, profile, refreshProfile]);

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
