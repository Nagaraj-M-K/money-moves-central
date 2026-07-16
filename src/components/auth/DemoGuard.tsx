import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DemoGuardProps {
  children: React.ReactNode;
}

export function DemoGuard({ children }: DemoGuardProps) {
  const { user, loading, signInDemo } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      signInDemo().catch((error) => {
        console.error('Auto demo sign-in failed:', error);
      });
    }
  }, [loading, user, signInDemo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Starting free trial...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
