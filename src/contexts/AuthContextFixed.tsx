
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { enhancedSignIn, enhancedSignUp, enhancedSignOut, UserRole } from '@/lib/auth-enhanced';

export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'wholesaler' | 'seller' | 'pending';
  created_at?: string;
  updated_at?: string;
  phone_number?: string;
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
  profile_image?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, role: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pakistani_green-600"></div>
  </div>
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000);
      });

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (!data) {
        console.log('No profile found for user:', userId);
        return null;
      }

      console.log('Profile fetched successfully:', data);
      return data as Profile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (initialSession?.user) {
          console.log('Found existing session');
          setUser(initialSession.user);
          setSession(initialSession);
          
          // Fetch profile with timeout
          const profileData = await fetchProfile(initialSession.user.id);
          if (mounted) {
            setProfile(profileData);
          }
        } else {
          console.log('No existing session found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event, newSession?.user?.email);
        
        if (!mounted) return;
        
        if (newSession?.user) {
          setUser(newSession.user);
          setSession(newSession);
          
          // Defer profile fetching to prevent blocking
          setTimeout(async () => {
            if (mounted) {
              const profileData = await fetchProfile(newSession.user.id);
              if (mounted) {
                setProfile(profileData);
              }
            }
          }, 0);
        } else {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      
      // Use enhanced sign in for better error handling
      await enhancedSignIn(email, password);

      toast({
        title: "Sign in successful",
        description: "Welcome back!",
        variant: "default"
      });

      return {};
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      
      // Use enhanced sign up for better error handling
      await enhancedSignUp(email, password, role as UserRole);

      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account",
        variant: "default"
      });

      return {};
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Use enhanced sign out for better cleanup
      await enhancedSignOut();
      
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Signed out successfully",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
