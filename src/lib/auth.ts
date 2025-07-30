/**
 * Authentication utilities and types for Farcaster Mini Apps
 * 
 * This file contains helper functions and types for managing authentication
 * in Farcaster Mini Apps using QuickAuth and context-based authentication.
 */

import { sdk } from '@farcaster/miniapp-sdk';

/**
 * Authentication configuration options
 */
export interface AuthConfig {
  /** Whether to require QuickAuth for authentication */
  requireQuickAuth?: boolean;
  /** Whether to allow context-only authentication for development */
  allowContextOnly?: boolean;
  /** Custom validation endpoint */
  validationEndpoint?: string;
  /** Authentication timeout in milliseconds */
  timeout?: number;
}

/**
 * Authentication result from sign-in attempts
 */
export interface AuthResult {
  /** Whether authentication was successful */
  success: boolean;
  /** User data if successful */
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
  /** Error message if failed */
  error?: string;
  /** Whether QuickAuth was used */
  usedQuickAuth: boolean;
}

/**
 * Validates a QuickAuth token with the server
 * 
 * @param token - The JWT token to validate
 * @param endpoint - Custom validation endpoint (optional)
 * @returns Promise<boolean> - Whether the token is valid
 */
export async function validateQuickAuthToken(
  token: string,
  endpoint: string = '/api/auth/validate'
): Promise<boolean> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    return response.ok;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
}

/**
 * Attempts to get a QuickAuth token
 * 
 * @returns Promise<string | null> - The token if available, null otherwise
 */
export async function getQuickAuthToken(): Promise<string | null> {
  try {
    const { token } = await sdk.quickAuth.getToken();
    return token || null;
  } catch (error) {
    console.warn('QuickAuth not available:', error);
    return null;
  }
}

/**
 * Performs a complete authentication flow
 * 
 * @param config - Authentication configuration
 * @returns Promise<AuthResult> - Authentication result
 */
export async function authenticate(config: AuthConfig = {}): Promise<AuthResult> {
  const {
    requireQuickAuth = false,
    allowContextOnly = true,
    validationEndpoint,
    timeout = 10000,
  } = config;

  try {
    // Try QuickAuth first
    const token = await getQuickAuthToken();
    
    if (token) {
      const isValid = await validateQuickAuthToken(token, validationEndpoint);
      
      if (isValid) {
        // Get user from context
        const context = sdk.context;
        if (context?.user?.fid) {
          return {
            success: true,
            user: {
              fid: context.user.fid,
              username: context.user.username,
              displayName: context.user.displayName,
              pfpUrl: context.user.pfpUrl,
            },
            usedQuickAuth: true,
          };
        }
      }
    }

    // If QuickAuth failed or not available
    if (requireQuickAuth) {
      return {
        success: false,
        error: 'QuickAuth is required but not available',
        usedQuickAuth: false,
      };
    }

    // Fallback to context-only authentication
    if (allowContextOnly) {
      const context = sdk.context;
      if (context?.user?.fid) {
        return {
          success: true,
          user: {
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          },
          usedQuickAuth: false,
        };
      }
    }

    return {
      success: false,
      error: 'No authentication method available',
      usedQuickAuth: false,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
      usedQuickAuth: false,
    };
  }
}

/**
 * Checks if the current environment supports QuickAuth
 * 
 * @returns Promise<boolean> - Whether QuickAuth is available
 */
export async function isQuickAuthAvailable(): Promise<boolean> {
  try {
    await sdk.quickAuth.getToken();
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets authentication capabilities for the current environment
 * 
 * @returns Promise<{quickAuth: boolean, context: boolean}>
 */
export async function getAuthCapabilities(): Promise<{
  quickAuth: boolean;
  context: boolean;
}> {
  const quickAuth = await isQuickAuthAvailable();
  const context = !!sdk.context?.user?.fid;

  return { quickAuth, context };
}

/**
 * Creates a user object from Farcaster context
 * 
 * @param contextUser - User data from Farcaster context
 * @returns User object with standardized structure
 */
export function createUserFromContext(contextUser: any): {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
} {
  return {
    fid: contextUser.fid,
    username: contextUser.username,
    displayName: contextUser.displayName,
    pfpUrl: contextUser.pfpUrl,
  };
} 