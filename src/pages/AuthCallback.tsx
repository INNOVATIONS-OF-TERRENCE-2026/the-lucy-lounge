/**
 * THE LUCY LOUNGE - Auth Callback Handler
 * 
 * Handles OAuth callbacks and email confirmation redirects:
 * - Email confirmation tokens
 * - Password reset tokens
 * - OAuth provider callbacks (Spotify, Google, etc.)
 * 
 * After processing, redirects to /chat
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingScreen } from '@/components/branding/LoadingScreen';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from URL (contains tokens)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Check for error in URL
        const error = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
        
        if (error) {
          throw new Error(errorDescription || error);
        }

        // Check for access token (email confirmation or OAuth)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type') || queryParams.get('type');

        if (accessToken && refreshToken) {
          // Set the session from URL tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;

          setStatus('success');
          
          if (type === 'recovery') {
            setMessage('Password reset successful! Redirecting...');
            toast({
              title: 'Password Reset',
              description: 'You can now set a new password.',
            });
            // Redirect to a password change page or chat
            setTimeout(() => navigate('/chat'), 1500);
          } else if (type === 'signup' || type === 'email_confirmation') {
            setMessage('Email confirmed! Welcome to Lucy AI. Redirecting...');
            toast({
              title: 'Email Confirmed!',
              description: 'Your account is now active. Welcome to Lucy AI!',
            });
            setTimeout(() => navigate('/chat'), 1500);
          } else {
            setMessage('Authentication successful! Redirecting...');
            toast({
              title: 'Welcome!',
              description: 'Successfully signed in.',
            });
            setTimeout(() => navigate('/chat'), 1000);
          }
          return;
        }

        // Check for code (PKCE flow)
        const code = queryParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;

          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          toast({
            title: 'Welcome!',
            description: 'Successfully signed in.',
          });
          setTimeout(() => navigate('/chat'), 1000);
          return;
        }

        // No tokens found - check if already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          setMessage('Already signed in. Redirecting...');
          setTimeout(() => navigate('/chat'), 500);
          return;
        }

        // No auth info found - redirect to login
        setStatus('error');
        setMessage('No authentication info found. Redirecting to login...');
        setTimeout(() => navigate('/auth'), 2000);

      } catch (err) {
        console.error('[AuthCallback] Error:', err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Authentication failed');
        toast({
          title: 'Authentication Error',
          description: err instanceof Error ? err.message : 'Please try again.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <LoadingScreen 
      message={message}
      showProgress={status === 'processing'}
    />
  );
};

export default AuthCallback;
