
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    console.log('Stored user data:', storedUser);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Parsed user data:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with:', email);
      // Enhanced mock authentication with validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
      };
      console.log('Created mock user:', mockUser);
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      console.log('User data saved to localStorage');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Signing up with:', { email, name });
      // Enhanced mock registration with validation
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: Date.now().toString(),
        email,
        name,
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
      };
      console.log('Created mock user:', mockUser);
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      console.log('User data saved to localStorage');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user:', user);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('transactions');
      localStorage.removeItem('watchlist');
      console.log('User data removed from localStorage');
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile }}>
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
