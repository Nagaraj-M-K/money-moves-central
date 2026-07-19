import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { getDemoUser, isDemoModeActive, setDemoModeActive, updateDemoUser } from '@/lib/demoStorage';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getAuthUserFromSession(session: Session): AuthUser {
  const email = session.user.email || `${session.user.id}@user.money.moves`;
  return {
    id: session.user.id,
    email,
    name: session.user.user_metadata?.full_name || 
          session.user.user_metadata?.name || 
          session.user.user_metadata?.display_name ||
          email.split('@')[0],
    photoURL: session.user.user_metadata?.avatar_url || 
             session.user.user_metadata?.picture,
    isDemo: false,
  };
}

function getAuthUserFromDemo(): AuthUser {
  const demoUser = getDemoUser();
  return {
    id: demoUser.id,
    email: demoUser.email,
    name: demoUser.name,
    photoURL: demoUser.photoURL,
    isDemo: true,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        if (session?.user) {
          setDemoModeActive(false);
          const authUser = getAuthUserFromSession(session);
          setUser(authUser);

          // Create profile for all users (authenticated and anonymous)
          // Each user gets their own separate data space
          setTimeout(async () => {
            try {
              const { error } = await supabase
                .from('profiles')
                .upsert({
                  user_id: session.user.id,
                  email: session.user.email || null,
                  full_name: authUser.name,
                  avatar_url: authUser.photoURL || null,
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id'
                });
              
              if (error && error.code !== '23505') {
                console.error('Error updating profile:', error);
              }
            } catch (err) {
              console.error('Profile update failed:', err);
            }
          }, 0);
        } else {
          setUser(isDemoModeActive() ? getAuthUserFromDemo() : null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
      }
      
      console.log('Initial session:', session);
      if (session) {
        setSession(session);
        setDemoModeActive(false);
        setUser(getAuthUserFromSession(session));
      } else if (isDemoModeActive()) {
        setUser(getAuthUserFromDemo());
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setDemoModeActive(false);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log('Sign in successful:', data);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setDemoModeActive(false);
      const { lovable } = await import('@/integrations/lovable/index');
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };


  const signInDemo = async () => {
    setDemoModeActive(true);
    setSession(null);
    setUser(getAuthUserFromDemo());
    setLoading(false);
    console.log('Local free trial started');
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setDemoModeActive(false);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: name,
          }
        }
      });

      if (error) throw error;
      
      console.log('Sign up successful:', data);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setDemoModeActive(false);
      if (!user?.isDemo) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      setUser(null);
      setSession(null);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    try {
      if (!user) throw new Error('No user logged in');

      if (user.isDemo) {
        const updatedDemoUser = updateDemoUser({
          name: data.name || user.name,
          photoURL: data.photoURL,
        });
        setUser({
          id: updatedDemoUser.id,
          email: updatedDemoUser.email,
          name: updatedDemoUser.name,
          photoURL: updatedDemoUser.photoURL,
          isDemo: true,
        });
        return;
      }
      
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: data.name,
          avatar_url: data.photoURL 
        }
      });

      if (authError) throw authError;

      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.name,
          avatar_url: data.photoURL,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      setUser({ ...user, ...data });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signIn, 
      signUp, 
      signInWithGoogle,
      signInDemo,
      signOut, 
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
