'use client';

import { ReactNode } from 'react';
import { useAuth } from '~/hooks/useAuth';
import { Button } from './Button';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

/**
 * AuthGuard component that handles authentication flow and protects content
 *
 * This component provides:
 * - Automatic authentication state management
 * - Loading states with proper UX
 * - Error handling with retry functionality
 * - Optional authentication requirement
 * - Graceful fallbacks for unauthenticated users
 *
 * @param {ReactNode} children - Content to render when authenticated
 * @param {ReactNode} fallback - Content to render when not authenticated (optional)
 * @param {boolean} requireAuth - Whether authentication is required (default: true)
 *
 * @example
 * ```tsx
 * // Require authentication
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 *
 * // Optional authentication with fallback
 * <AuthGuard fallback={<PublicContent />} requireAuth={false}>
 *   <EnhancedContent />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({ 
  children, 
  fallback, 
  requireAuth = true 
}: AuthGuardProps) {
  const { user, status, signIn, signOut, error, clearError } = useAuth();

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Authentication Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'An error occurred during authentication'}
          </p>
          <div className="flex gap-2">
            <Button onClick={clearError}>Dismiss</Button>
            <Button onClick={signIn} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated state
  if (status === 'authenticated' && user) {
    return <>{children}</>;
  }

  // Unauthenticated state
  if (status === 'unauthenticated') {
    // If authentication is not required, show fallback or children
    if (!requireAuth) {
      return <>{fallback || children}</>;
    }

    // Show sign-in prompt
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
        <div className="text-center max-w-md">
          <div className="text-blue-500 text-4xl mb-4">🔐</div>
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please sign in with your Farcaster account to continue
          </p>
          <Button onClick={signIn} variant="primary" className="w-full">
            Sign In with Farcaster
          </Button>
        </div>
      </div>
    );
  }

  // Fallback for unexpected states
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">Unexpected state</p>
      </div>
    </div>
  );
}

/**
 * AuthStatus component that displays current authentication status
 *
 * This component shows the current user's authentication status and provides
 * quick access to sign-in/sign-out functionality.
 *
 * @example
 * ```tsx
 * <AuthStatus />
 * ```
 */
export function AuthStatus() {
  const { user, status, signIn, signOut } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="spinner h-4 w-4"></div>
        <span>Authenticating...</span>
      </div>
    );
  }

  if (status === 'authenticated' && user) {
    return (
      <div className="flex items-center gap-3">
        {user.pfpUrl && (
          <img
            src={user.pfpUrl}
            alt="Profile"
            className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700"
          />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {user.displayName || user.username || `FID: ${user.fid}`}
          </span>
          {user.username && (
            <span className="text-xs text-gray-500">@{user.username}</span>
          )}
        </div>
        <Button onClick={signOut} variant="ghost" size="sm">
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Not signed in</span>
      <Button onClick={signIn} variant="primary" size="sm">
        Sign In
      </Button>
    </div>
  );
} 