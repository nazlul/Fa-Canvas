'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth, type AuthenticatedUser, type AuthStatus } from '~/hooks/useAuth';

interface AuthContextType {
  user: AuthenticatedUser | null;
  status: AuthStatus;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that provides authentication context
 *
 * This provider wraps the authentication hook and makes it available
 * throughout the component tree via React Context.
 *
 * @param {ReactNode} children - Child components that will have access to auth context
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context
 *
 * This hook provides access to the authentication state and methods
 * from anywhere in the component tree.
 *
 * @returns {AuthContextType} Authentication context with user state and methods
 *
 * @example
 * ```tsx
 * const { user, status, signIn, signOut } = useAuthContext();
 * ```
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
} 