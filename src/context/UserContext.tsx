
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  subscription: {
    plan: string;
    status: 'active' | 'inactive' | 'trial';
    expiresAt: string;
  } | null;
  preferences: {
    currency: 'USD' | 'INR' | 'EUR';
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  createdAt: string;
  lastLoginAt: string;
}

interface UserContextType {
  user: UserProfile | null;
  updateUser: (updates: Partial<UserProfile>) => void;
  updateSubscription: (subscription: UserProfile['subscription']) => void;
  isLoading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading user data from database
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        // In production, this would fetch from your database
        const savedUser = localStorage.getItem('userProfile');
        const savedAuth = localStorage.getItem('auth');
        
        if (savedUser && savedAuth) {
          const parsedUser = JSON.parse(savedUser);
          const authData = JSON.parse(savedAuth);
          
          // Check if user is authenticated
          if (authData.isAuthenticated) {
            setUser(parsedUser);
          }
        } else if (savedAuth) {
          // Create default user profile if authenticated but no profile exists
          const authData = JSON.parse(savedAuth);
          if (authData.isAuthenticated) {
            const defaultUser: UserProfile = {
              id: authData.user?.id || 'user-1',
              email: authData.user?.email || 'user@example.com',
              name: authData.user?.name || 'User',
              subscription: null,
              preferences: {
                currency: 'USD',
                notifications: true,
                theme: 'system'
              },
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
            
            setUser(defaultUser);
            localStorage.setItem('userProfile', JSON.stringify(defaultUser));
          }
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
    }
  };

  const updateSubscription = (subscription: UserProfile['subscription']) => {
    if (user) {
      const updatedUser = { ...user, subscription };
      setUser(updatedUser);
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      updateUser,
      updateSubscription,
      isLoading,
      error,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
