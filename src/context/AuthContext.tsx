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
      // TODO: Implement actual authentication
      const mockUser = {
        id: '1',
        email,
        name: email.split('@')[0], // Use the part before @ as the name
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`, // Generate avatar based on email
      };
      console.log('Created mock user:', mockUser);
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      console.log('User data saved to localStorage');
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error('Failed to sign in');
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Signing up with:', { email, name });
      // TODO: Implement actual registration
      const mockUser = {
        id: '1',
        email,
        name,
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`, // Generate avatar based on email
      };
      console.log('Created mock user:', mockUser);
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      console.log('User data saved to localStorage');
    } catch (error) {
      console.error('Sign up error:', error);
      throw new Error('Failed to sign up');
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user:', user);
      setUser(null);
      localStorage.removeItem('user');
      console.log('User data removed from localStorage');
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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