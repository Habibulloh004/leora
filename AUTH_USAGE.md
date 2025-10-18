# Authentication System Usage Guide

This guide explains how to use the fully functional authentication system in the Leora app.

## Overview

The authentication system uses:
- **Zustand** for state management
- **AsyncStorage** for data persistence
- Local storage for user accounts (can be easily replaced with a backend API)

## Features

✅ User Registration
✅ User Login
✅ Forgot Password with OTP
✅ Remember Me functionality
✅ Automatic session persistence
✅ Navigation guards
✅ Logout functionality

## How It Works

### 1. Registration Flow

Users can register with:
- Email or Phone number
- Full name
- Password (min 6 characters)
- Password confirmation

**File:** `app/(auth)/register.tsx`

```typescript
import { useAuthStore } from '@/stores/useAuthStore';

const { register, isLoading, error } = useAuthStore();

await register({
  emailOrPhone: 'user@example.com',
  fullName: 'John Doe',
  password: 'password123',
  confirmPassword: 'password123',
});
```

### 2. Login Flow

Users can login with:
- Email or Username
- Password
- Optional "Remember Me" checkbox

**File:** `app/(auth)/login.tsx`

```typescript
import { useAuthStore } from '@/stores/useAuthStore';

const { login, isLoading, error } = useAuthStore();

await login({
  emailOrUsername: 'user@example.com',
  password: 'password123',
  rememberMe: true,
});
```

### 3. Forgot Password Flow

Two-step process:
1. **Email Verification**: User enters email and receives OTP (check console for testing)
2. **OTP Verification**: User enters 4-digit OTP code

**File:** `app/(auth)/forgot-password.tsx`

```typescript
import { useAuthStore } from '@/stores/useAuthStore';

const { sendPasswordResetCode, verifyPasswordResetOtp } = useAuthStore();

// Step 1: Send OTP
await sendPasswordResetCode('user@example.com');

// Step 2: Verify OTP
await verifyPasswordResetOtp('1234');
```

**Note:** For testing, the OTP is logged to the console. In production, this would be sent via email/SMS.

### 4. Logout

Use the `LogoutButton` component or call logout directly:

```typescript
import { LogoutButton } from '@/components/auth';

// Use the component
<LogoutButton variant="both" />

// Or call logout directly
import { useAuthStore } from '@/stores/useAuthStore';

const { logout } = useAuthStore();
await logout();
```

## Authentication Store API

### State

```typescript
{
  user: User | null;                    // Current logged-in user
  isAuthenticated: boolean;             // Authentication status
  isLoading: boolean;                   // Loading state for async operations
  rememberMe: boolean;                  // Remember me preference
  error: string | null;                 // Error messages
  pendingPasswordResetEmail: string | null; // Email pending password reset
  passwordResetOtp: string | null;      // Verified OTP code
}
```

### Actions

```typescript
// Login
login(credentials: LoginCredentials): Promise<boolean>

// Register
register(credentials: RegisterCredentials): Promise<boolean>

// Logout
logout(): Promise<void>

// Password Reset
sendPasswordResetCode(email: string): Promise<boolean>
verifyPasswordResetOtp(otp: string): Promise<boolean>
resetPassword(newPassword: string): Promise<boolean>

// User Management
updateUser(updates: Partial<User>): void

// Utility
clearError(): void
setRememberMe(value: boolean): void
validateEmail(email: string): boolean
validatePassword(password: string): { valid: boolean; message?: string }
```

## Navigation Guards

The app automatically protects routes:

**Root Layout** (`app/_layout.tsx`):
- Redirects unauthenticated users to login
- Redirects authenticated users away from auth screens

**Auth Layout** (`app/(auth)/_layout.tsx`):
- Redirects authenticated users to main app

## Data Storage

### User Data
- Stored in AsyncStorage under key: `registered-users`
- Passwords stored separately (hashed in production): `user-password-{userId}`

### Auth Session
- Stored in AsyncStorage under key: `auth-storage`
- Persists: user, isAuthenticated, rememberMe

## Testing the App

### 1. First Time Use
When you first run the app:
- You'll be redirected to the login screen
- Click "Sign Up" to create an account
- Fill in the registration form
- You'll be auto-logged in after registration

### 2. Register a Test User
```
Email: test@leora.com
Full Name: Test User
Password: test123
Confirm Password: test123
```

### 3. Login
```
Email/Username: test@leora.com
Password: test123
☑️ Remember Me (optional)
```

### 4. Forgot Password
```
Email: test@leora.com
→ Check console for OTP (e.g., "Password reset OTP: 1234")
→ Enter the 4-digit code
→ Password will be reset
```

### 5. Logout
Add the LogoutButton to any screen:
```typescript
import { LogoutButton } from '@/components/auth';

<LogoutButton variant="both" />
```

## Example: Adding Logout to Settings Screen

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LogoutButton } from '@/components/auth';
import { useAuthStore } from '@/stores/useAuthStore';

export default function SettingsScreen() {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user?.fullName}!</Text>
      <Text style={styles.email}>{user?.email}</Text>

      {/* Logout Button */}
      <LogoutButton variant="both" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});
```

## Customization

### Change Password Validation Rules

Edit `src/stores/useAuthStore.ts`:

```typescript
validatePassword: (password: string) => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain a number' };
  }
  return { valid: true };
}
```

### Connect to Backend API

Replace local storage logic with API calls:

```typescript
login: async (credentials: LoginCredentials) => {
  set({ isLoading: true, error: null });

  try {
    // Instead of local storage, call your API
    const response = await fetch('https://api.yourapp.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (data.success) {
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }

    set({ error: data.message, isLoading: false });
    return false;
  } catch (error) {
    set({ error: 'Network error', isLoading: false });
    return false;
  }
}
```

## Security Notes

⚠️ **For Production:**

1. **Never store passwords in plain text** - Currently passwords are stored unencrypted for demo purposes. Use backend authentication in production.

2. **Use HTTPS** - Always use secure connections for API calls

3. **Token-based auth** - Implement JWT or similar token-based authentication

4. **Secure storage** - Use `expo-secure-store` for sensitive data instead of AsyncStorage

5. **Rate limiting** - Add rate limiting to prevent brute force attacks

6. **Password hashing** - Hash passwords on the backend before storing

## Troubleshooting

### Issue: User stays logged in after closing app
This is expected behavior when "Remember Me" is enabled. The auth state is persisted in AsyncStorage.

### Issue: Can't login after registration
Check the console for error messages. Ensure email/password match what you registered with.

### Issue: OTP not working
Check the console output for the generated OTP. The OTP expires after 5 minutes.

### Issue: Navigation not redirecting
Make sure you're using `router.replace()` instead of `router.push()` for auth redirects.

## Files Reference

- `src/stores/useAuthStore.ts` - Main authentication store
- `src/types/auth.types.ts` - TypeScript types
- `app/(auth)/login.tsx` - Login screen
- `app/(auth)/register.tsx` - Registration screen
- `app/(auth)/forgot-password.tsx` - Password reset screen
- `app/(auth)/_layout.tsx` - Auth layout with guards
- `app/_layout.tsx` - Root layout with auth protection
- `src/components/auth/LogoutButton.tsx` - Logout button component

## Next Steps

1. ✅ Authentication system is fully functional
2. 🔄 Add user profile editing
3. 🔄 Add email verification
4. 🔄 Add social login (Google, Facebook, Apple)
5. 🔄 Add biometric authentication
6. 🔄 Connect to backend API
7. 🔄 Add password strength indicator
8. 🔄 Add session timeout

---

**Need help?** The authentication system is production-ready for local development. For production use, integrate with a backend API and implement proper security measures.
