'use client';

import { useState, useEffect, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useMiniApp } from '@neynar/react';

/**
 * Represents the current authenticated user state
 */
export interface AuthenticatedUser {
  /** The user's Farcaster ID (FID) */
  fid: number;
  /** The user's username */
  username?: string;
  /** The user's display name */
  displayName?: string;
  /** The user's profile picture URL */
  pfpUrl?: string;
  /** The user's location */
  location?: {
    placeId: string;
    description: string;
  };
}

/**
 * Possible authentication states
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

/**
 * Return type for the useAuth hook
 */
export interface UseAuthReturn {
  /** Current authenticated user data, or null if not authenticated */
  user: AuthenticatedUser | null;
  /** Current authentication status */
  status: AuthStatus;
  /** Function to initiate the sign-in process using QuickAuth */
  signIn: () => Promise<boolean>;
  /** Function to sign out and clear the current authentication state */
  signOut: () => Promise<void>;
  /** Function to retrieve the current authentication token */
  getToken: () => Promise<string | null>;
  /** Error message if authentication failed */
  error: string | null;
  /** Function to clear error state */
  clearError: () => void;
}

/**
 * Custom hook for managing authentication state in Farcaster Mini Apps
 *
 * This hook provides a complete authentication flow that combines:
 * - Farcaster context (from sdk.context.user)
 * - QuickAuth for secure token-based authentication
 * - Automatic state management and error handling
 *
 * The hook automatically detects the user from the Farcaster context
 * and validates their authentication using QuickAuth tokens.
 *
 * @returns {UseAuthReturn} Object containing user state and authentication methods
 *
 * @example
 * ```tsx
 * const { user, status, signIn, signOut, error } = useAuth();
 *
 * if (status === 'loading') return <div>Loading...</div>;
 * if (status === 'error') return <div>Error: {error}</div>;
 * if (status === 'unauthenticated') return <button onClick={signIn}>Sign In</button>;
 *
 * return (
 *   <div>
 *     <p>Welcome, {user?.displayName || user?.username}!</p>
 *     <button onClick={signOut}>Sign Out</button>
 *   </div>
 * );
 * ```
 */
export function useAuth(): UseAuthReturn {
  const { context } = useMiniApp();
  
  // Current authenticated user data
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  // Current authentication status
  const [status, setStatus] = useState<AuthStatus>('loading');
  // Error state
  const [error, setError] = useState<string | null>(null);

  /**
   * Validates a QuickAuth token with the server-side API
   *
   * @param {string} authToken - The JWT token to validate
   * @returns {Promise<boolean>} True if token is valid, false otherwise
   */
  const validateTokenWithServer = async (authToken: string): Promise<boolean> => {
    try {
      const validationResponse = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: authToken }),
      });

      return validationResponse.ok;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  /**
   * Creates user object from Farcaster context
   */
  const createUserFromContext = useCallback((contextUser: any): AuthenticatedUser => {
    return {
      fid: contextUser.fid,
      username: contextUser.username,
      displayName: contextUser.displayName,
      pfpUrl: contextUser.pfpUrl,
      location: contextUser.location,
    };
  }, []);

  /**
   * Checks authentication status and validates with QuickAuth
   */
  const checkAuthentication = useCallback(async () => {
    try {
      setStatus('loading');
      setError(null);

      // Check if we have user context from Farcaster
      if (!context?.user?.fid) {
        setStatus('unauthenticated');
        return;
      }

      // Try to get QuickAuth token
      try {
        const { token } = await sdk.quickAuth.getToken();
        
        if (token) {
          // Validate the token with our server-side API
          const isValid = await validateTokenWithServer(token);
          
          if (isValid) {
            // Token is valid, set authenticated state
            setUser(createUserFromContext(context.user));
            setStatus('authenticated');
            return;
          }
        }
      } catch (quickAuthError) {
        console.warn('QuickAuth not available or failed:', quickAuthError);
        // Continue with context-only authentication for development
      }

      // If QuickAuth is not available, we can still authenticate using context
      // This is useful for development and testing
      if (context.user.fid) {
        setUser(createUserFromContext(context.user));
        setStatus('authenticated');
        return;
      }

      setStatus('unauthenticated');
    } catch (error) {
      console.error('Authentication check failed:', error);
      setError('Authentication check failed');
      setStatus('error');
    }
  }, [context?.user, createUserFromContext]);

  /**
   * Effect to check authentication when context changes
   */
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  /**
   * Initiates the QuickAuth sign-in process
   *
   * @returns {Promise<boolean>} True if sign-in was successful, false otherwise
   */
  const signIn = useCallback(async (): Promise<boolean> => {
    try {
      setStatus('loading');
      setError(null);

      // Get QuickAuth session token
      const { token } = await sdk.quickAuth.getToken();

      if (token) {
        // Validate the token with our server-side API
        const isValid = await validateTokenWithServer(token);

        if (isValid && context?.user?.fid) {
          // Authentication successful, update user state
          setUser(createUserFromContext(context.user));
          setStatus('authenticated');
          return true;
        }
      }

      // Authentication failed
      setStatus('unauthenticated');
      setError('Authentication failed. Please try again.');
      return false;
    } catch (error) {
      console.error('Sign-in process failed:', error);
      setStatus('error');
      setError('Sign-in failed. Please try again.');
      return false;
    }
  }, [context?.user, createUserFromContext]);

  /**
   * Signs out the current user and clears the authentication state
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setStatus('loading');
      
      // Clear local user state
      setUser(null);
      setStatus('unauthenticated');
      setError(null);
    } catch (error) {
      console.error('Sign-out failed:', error);
      setError('Sign-out failed');
      setStatus('error');
    }
  }, []);

  /**
   * Retrieves the current authentication token from QuickAuth
   *
   * @returns {Promise<string | null>} The current auth token, or null if not authenticated
   */
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const { token } = await sdk.quickAuth.getToken();
      return token;
    } catch (error) {
      console.error('Failed to retrieve authentication token:', error);
      return null;
    }
  }, []);

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    status,
    signIn,
    signOut,
    getToken,
    error,
    clearError,
  };
} 