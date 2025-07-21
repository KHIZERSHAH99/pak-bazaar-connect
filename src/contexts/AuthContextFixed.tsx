
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { phoneSignIn, phoneSignUp } from '@/lib/phone-auth';
import { UserRole } from '@/lib/types';

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
  signIn: (phoneOrEmail: string, password: string) => Promise<{ error?: string }>;
  signUp: (phoneOrEmail: string, password: string, role: string, businessData?: Record<string, any>) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const { toast } = useToast();

  const fetchProfile = async (userId: string, retryCount = 0): Promise<Profile | null> => {
    try {
      console.log(`Fetching profile for user: ${userId} (attempt ${retryCount + 1})`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile not found and this is a first attempt, try to create it
        if (error.code === 'PGRST116' && retryCount === 0) {
          console.log('Profile not found, attempting to create...');
          
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: currentUser.id,
                email: currentUser.email || '',
                phone_number: currentUser.user_metadata?.phone_number || '03000000000',
                role: currentUser.user_metadata?.role || 'pending',
                contact_name: currentUser.user_metadata?.contact_name || 'User',
                business_name: currentUser.user_metadata?.business_name || 'Business'
              });
            
            if (createError) {
              console.error('Failed to create profile:', createError);
              return null;
            }
            
            // Retry fetching after creation
            return fetchProfile(userId, retryCount + 1);
          }
        }
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
    let initTimeout: NodeJS.Timeout;
    
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth context...');
        setLoading(true);
        
        // Set a timeout to prevent infinite loading
        initTimeout = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout');
            setLoading(false);
            setInitializationAttempts(prev => prev + 1);
          }
        }, 10000);

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
            clearTimeout(initTimeout);
          }
          return;
        }

        if (!mounted) return;
        
        clearTimeout(initTimeout);
        
        if (initialSession?.user) {
          console.log('✅ Found existing session');
          setUser(initialSession.user);
          setSession(initialSession);
          
          // Fetch profile with retry logic
          const profileData = await fetchProfile(initialSession.user.id);
          if (mounted) {
            setProfile(profileData);
          }
        } else {
          console.log('ℹ️ No existing session found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(initTimeout);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔄 Auth state change:', event, newSession?.user?.email || 'no user');
        
        if (!mounted) return;
        
        setUser(newSession?.user ?? null);
        setSession(newSession);
        
        if (newSession?.user) {
          // Use setTimeout to prevent blocking the auth state change
          setTimeout(async () => {
            if (mounted) {
              const profileData = await fetchProfile(newSession.user.id);
              if (mounted) {
                setProfile(profileData);
              }
            }
          }, 100);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      if (initTimeout) clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [initializationAttempts]);

  const signIn = async (phoneOrEmail: string, password: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      
      // Determine if input is phone number or email
      const isPhoneNumber = /^[\d\s\+\-\(\)]+$/.test(phoneOrEmail.trim());
      
      if (isPhoneNumber) {
        await phoneSignIn(phoneOrEmail, password);
      } else {
        // Use email authentication
        const cleanEmail = phoneOrEmail.toLowerCase().trim();
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (error) {
          console.error('Email sign in error:', error);
          throw new Error(error.message);
        }
      }

      toast({
        title: "Sign in successful",
        description: "Welcome back!",
        variant: "default"
      });

      return {};
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (phoneOrEmail: string, password: string, role: string, businessData?: Record<string, any>): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      
      // Determine if input is phone number or email
      const isPhoneNumber = /^[\d\s\+\-\(\)]+$/.test(phoneOrEmail.trim());
      
      if (isPhoneNumber) {
        await phoneSignUp(phoneOrEmail, password, role as UserRole, businessData || {});
      } else {
        // Use email authentication
        const cleanEmail = phoneOrEmail.toLowerCase().trim();
        
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              role: role,
              ...businessData
            }
          }
        });

        if (error) {
          console.error('Email sign up error:', error);
          throw new Error(error.message);
        }
      }

      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account",
        variant: "default"
      });

      return {};
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clean up auth-related storage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
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
