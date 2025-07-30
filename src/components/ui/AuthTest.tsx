'use client';

import { useAuth } from '~/hooks/useAuth';
import { AuthGuard, AuthStatus } from './AuthGuard';
import { Button } from './Button';

/**
 * AuthTest component for testing authentication functionality
 * 
 * This component provides a comprehensive test interface for the authentication system.
 * It displays current auth state, allows testing sign-in/sign-out, and shows user information.
 */
export function AuthTest() {
  const { user, status, signIn, signOut, error, clearError } = useAuth();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Authentication Test</h2>
      
      {/* Status Display */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Current Status</h3>
        <div className="space-y-1 text-sm">
          <p><strong>Status:</strong> {status}</p>
          <p><strong>User:</strong> {user ? `${user.displayName || user.username} (FID: ${user.fid})` : 'None'}</p>
          {error && (
            <p><strong>Error:</strong> <span className="text-red-600">{error}</span></p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={signIn} disabled={status === 'loading'}>
          Sign In
        </Button>
        <Button onClick={signOut} disabled={status !== 'authenticated'}>
          Sign Out
        </Button>
        {error && (
          <Button onClick={clearError} variant="secondary">
            Clear Error
          </Button>
        )}
      </div>

      {/* AuthGuard Test */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">AuthGuard Test</h3>
        <AuthGuard fallback={<p className="text-gray-600">This content requires authentication</p>}>
          <p className="text-green-600">✅ This content is protected and you are authenticated!</p>
        </AuthGuard>
      </div>

      {/* AuthStatus Test */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">AuthStatus Test</h3>
        <AuthStatus />
      </div>

      {/* User Information */}
      {user && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">User Information</h3>
          <div className="space-y-1 text-sm">
            <p><strong>FID:</strong> {user.fid}</p>
            <p><strong>Username:</strong> {user.username || 'Not set'}</p>
            <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
            <p><strong>Profile Picture:</strong> {user.pfpUrl ? 'Available' : 'Not set'}</p>
            {user.location && (
              <p><strong>Location:</strong> {user.location.description}</p>
            )}
          </div>
          {user.pfpUrl && (
            <img 
              src={user.pfpUrl} 
              alt="Profile" 
              className="w-16 h-16 rounded-full mt-2 border-2 border-gray-300"
            />
          )}
        </div>
      )}

      {/* Debug Information */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information</h3>
        <details className="text-sm">
          <summary className="cursor-pointer">Click to expand</summary>
          <pre className="mt-2 bg-gray-200 dark:bg-gray-700 p-2 rounded text-xs overflow-auto">
            {JSON.stringify({ user, status, error }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
} 