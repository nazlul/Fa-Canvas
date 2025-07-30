# Farcaster Mini App Authentication System

This document describes the comprehensive authentication system designed for Farcaster Mini Apps, following the official guidelines and best practices.

## Overview

The authentication system combines Farcaster's QuickAuth with context-based authentication to provide a robust, secure, and user-friendly authentication experience. It follows the [Farcaster Mini App guidelines](https://miniapps.farcaster.xyz/docs/sdk/context) and implements the recommended authentication patterns.

## Architecture

### Core Components

1. **`useAuth` Hook** (`src/hooks/useAuth.ts`)
   - Main authentication hook that manages state
   - Combines QuickAuth with Farcaster context
   - Provides loading, error, and success states

2. **`AuthGuard` Component** (`src/components/ui/AuthGuard.tsx`)
   - Protects content based on authentication status
   - Provides loading and error states with retry functionality
   - Supports optional authentication with fallbacks

3. **`AuthProvider`** (`src/components/providers/AuthProvider.tsx`)
   - Provides authentication context throughout the app
   - Wraps the authentication hook for global access

4. **Authentication Utilities** (`src/lib/auth.ts`)
   - Helper functions for token validation
   - Authentication flow management
   - Capability detection

## Authentication Flow

### 1. Initial Load
```typescript
// App loads and SDK initializes
const { user, status, signIn } = useAuth();

// Status transitions: 'loading' → 'authenticated' | 'unauthenticated' | 'error'
```

### 2. Authentication Check
```typescript
// Check Farcaster context
if (context?.user?.fid) {
  // Try QuickAuth token validation
  const token = await sdk.quickAuth.getToken();
  if (token && await validateToken(token)) {
    // Authenticated with QuickAuth
    setStatus('authenticated');
  } else {
    // Fallback to context-only (development mode)
    setStatus('authenticated');
  }
} else {
  setStatus('unauthenticated');
}
```

### 3. Sign-In Process
```typescript
const handleSignIn = async () => {
  try {
    const { token } = await sdk.quickAuth.getToken();
    if (token && await validateToken(token)) {
      setUser(createUserFromContext(context.user));
      setStatus('authenticated');
      return true;
    }
    return false;
  } catch (error) {
    setError('Authentication failed');
    return false;
  }
};
```

## Usage Examples

### Basic Authentication Guard
```tsx
import { AuthGuard } from '~/components/ui/AuthGuard';

function App() {
  return (
    <AuthGuard>
      <ProtectedContent />
    </AuthGuard>
  );
}
```

### Optional Authentication with Fallback
```tsx
<AuthGuard fallback={<PublicContent />} requireAuth={false}>
  <EnhancedContent />
</AuthGuard>
```

### Custom Authentication Hook
```tsx
import { useAuth } from '~/hooks/useAuth';

function MyComponent() {
  const { user, status, signIn, signOut, error } = useAuth();

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'error') return <ErrorMessage error={error} />;
  if (status === 'unauthenticated') return <SignInPrompt onSignIn={signIn} />;

  return (
    <div>
      <h1>Welcome, {user?.displayName}!</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Authentication Status Display
```tsx
import { AuthStatus } from '~/components/ui/AuthGuard';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <AuthStatus />
    </header>
  );
}
```

## Security Features

### 1. Token Validation
- All QuickAuth tokens are validated server-side
- Tokens are checked for expiration and signature
- Invalid tokens are automatically cleared

### 2. Context Validation
- Farcaster context is verified for authenticity
- User data is sanitized before use
- Fallback mechanisms for development

### 3. Error Handling
- Comprehensive error states
- User-friendly error messages
- Retry mechanisms for failed authentication

### 4. State Management
- Secure token storage (in-memory only)
- Automatic cleanup on sign-out
- Session persistence across app reloads

## Configuration

### Environment Variables
```env
# Required for QuickAuth validation
NEXT_PUBLIC_URL=https://your-app.com

# Optional: Custom validation endpoint
AUTH_VALIDATION_ENDPOINT=/api/auth/validate
```

### Authentication Options
```typescript
// In your auth configuration
const authConfig = {
  requireQuickAuth: false,        // Whether to require QuickAuth
  allowContextOnly: true,         // Allow context-only auth for dev
  validationEndpoint: '/api/auth/validate',
  timeout: 10000,                // Auth timeout in ms
};
```

## API Endpoints

### Token Validation (`/api/auth/validate`)
```typescript
POST /api/auth/validate
Content-Type: application/json

{
  "token": "quickauth.jwt.token"
}

// Response
{
  "success": true,
  "user": {
    "fid": 12345,
    "username": "alice",
    "displayName": "Alice"
  }
}
```

## Best Practices

### 1. Always Use AuthGuard
```tsx
// ✅ Good
<AuthGuard>
  <SensitiveContent />
</AuthGuard>

// ❌ Bad
{user && <SensitiveContent />}
```

### 2. Handle Loading States
```tsx
// ✅ Good
if (status === 'loading') return <LoadingSpinner />;

// ❌ Bad
if (!user) return <SignInPrompt />;
```

### 3. Provide Error Recovery
```tsx
// ✅ Good
if (status === 'error') {
  return (
    <div>
      <p>Error: {error}</p>
      <button onClick={signIn}>Try Again</button>
    </div>
  );
}
```

### 4. Use Context for Global State
```tsx
// ✅ Good
const { user } = useAuthContext();

// ❌ Bad
const { user } = useAuth(); // In deeply nested components
```

## Testing

### Unit Tests
```typescript
import { renderHook } from '@testing-library/react';
import { useAuth } from '~/hooks/useAuth';

test('should handle authentication flow', async () => {
  const { result } = renderHook(() => useAuth());
  
  expect(result.current.status).toBe('loading');
  
  // Wait for authentication check
  await waitFor(() => {
    expect(result.current.status).toBe('authenticated');
  });
});
```

### Integration Tests
```typescript
test('should protect content with AuthGuard', () => {
  render(
    <AuthGuard>
      <ProtectedContent />
    </AuthGuard>
  );
  
  expect(screen.getByText('Sign In Required')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **QuickAuth Not Available**
   - Check if running in Farcaster client
   - Verify SDK initialization
   - Use context-only fallback for development

2. **Token Validation Fails**
   - Check server endpoint configuration
   - Verify domain settings
   - Check network connectivity

3. **Context Not Available**
   - Ensure app is loaded in Farcaster client
   - Check SDK initialization order
   - Verify manifest configuration

### Debug Mode
```typescript
// Enable debug logging
const DEBUG_AUTH = process.env.NODE_ENV === 'development';

if (DEBUG_AUTH) {
  console.log('Auth status:', status);
  console.log('User:', user);
  console.log('Error:', error);
}
```

## Migration Guide

### From Old Auth System
```typescript
// Old
const { authenticatedUser, status, signIn } = useQuickAuth();

// New
const { user, status, signIn } = useAuth();
```

### Update Components
```tsx
// Old
{authenticatedUser && <Content />}

// New
<AuthGuard>
  <Content />
</AuthGuard>
```

## References

- [Farcaster Mini App Context Documentation](https://miniapps.farcaster.xyz/docs/sdk/context)
- [QuickAuth Documentation](https://miniapps.farcaster.xyz/docs/guides/agents-checklist)
- [Farcaster Mini App Guidelines](https://miniapps.farcaster.xyz/docs/guides/agents-checklist)

## Support

For issues with this authentication system:

1. Check the troubleshooting section above
2. Review the Farcaster Mini App documentation
3. Contact the Farcaster team on Farcaster (@pirosb3, @linda, @deodad)
4. Open an issue in the project repository 