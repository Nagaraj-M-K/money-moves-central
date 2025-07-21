
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function GoogleCallback() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Handle the OAuth callback
    const handleOAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        
        if (error) {
          console.error('OAuth error:', error);
          toast({
            title: "Authentication Error",
            description: "Google login failed. Please try again.",
            variant: "destructive",
          });
          navigate('/signin');
          return;
        }

        // Wait a moment for session to be established
        const timeout = setTimeout(() => {
          if (session) {
            toast({
              title: "Welcome!",
              description: "Successfully signed in with Google.",
            });
            navigate('/');
          } else {
            // If no session after timeout, redirect to signin
            console.log('No session found after OAuth callback');
            navigate('/signin');
          }
        }, 1000);

        return () => clearTimeout(timeout);
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/signin');
      }
    };

    // Only run if we're not already processing
    if (window.location.pathname === '/auth/callback') {
      handleOAuthCallback();
    }
  }, [session, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing Google sign in...</p>
      </div>
    </div>
  );
}
