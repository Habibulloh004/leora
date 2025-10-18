# Enhanced Authentication UI - Validation Guide

## Overview

This guide documents the professional authentication UI implementation with enhanced validation and visual feedback for the Leora app. The system uses **Zod** for schema validation with custom React components for a polished user experience.

## Features

✅ **Professional Visual States**
- **Default**: Translucent gradient background with thin white border (unfocused, no errors)
- **Focused**: Bright bluish border (#667eea) with increased thickness
- **Error**: Red border (#ff4d4f) with red-tinted text and placeholder

✅ **Smooth Animations**
- Animated border color transitions using React Native Animated API
- Smooth error message appearance/disappearance
- Spring-based animations for natural feel

✅ **Validation Features**
- Zod-based schema validation
- Real-time validation on blur
- Optional validation on change
- Custom validation functions
- Detailed error messages

## Components

### 1. Enhanced Input Component

**Location**: `src/components/auth/Input.tsx`

#### Props

```typescript
interface InputProps extends TextInputProps {
  icon?: React.ReactNode;           // Optional icon (left side)
  isPassword?: boolean;              // Password field with show/hide toggle
  error?: string;                    // External error message
  isValid?: boolean;                 // External validation state
  onValidate?: (value: string) => string | undefined;  // Validation function
  validateOnBlur?: boolean;          // Validate when input loses focus (default: true)
  validateOnChange?: boolean;        // Validate on every change (default: false)
}
```

#### Visual States

| State | Border Color | Border Width | Description |
|-------|-------------|--------------|-------------|
| Default | `rgba(255,255,255,0.08)` | 1px | Unfocused, no errors |
| Focused | `#667eea` | 2px | User is actively typing |
| Error | `#ff4d4f` | 1px | Validation failed |

#### Example Usage

```tsx
import { Input } from '@/components/auth';
import { validateEmail } from '@/utils/validation';

// Basic usage with validation
<Input
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
  icon={<Mail size={20} color="#A6A6B9" />}
  error={emailError}
  onValidate={validateEmail}
  validateOnBlur={true}
/>

// Password field with validation
<Input
  placeholder="Password"
  value={password}
  onChangeText={setPassword}
  isPassword
  icon={<Lock size={20} color="#A6A6B9" />}
  error={passwordError}
  onValidate={validatePassword}
  validateOnBlur={true}
/>
```

### 2. Button Component

**Location**: `src/components/auth/Button.tsx`

#### Props

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  disabled?: boolean;
  onValidationError?: () => void;  // Called when validation fails
}
```

#### Key Features

- **Enabled by default** (no longer disabled when fields are empty)
- Validation happens on press
- Consistent gradient background matching input fields
- Loading state with ActivityIndicator

### 3. Validation Utilities

**Location**: `src/utils/validation.ts`

#### Available Validators

```typescript
// Email validation
validateEmail(value: string): string | undefined

// Username validation (3-20 chars, alphanumeric + underscore)
validateUsername(value: string): string | undefined

// Password validation (min 8 chars, uppercase, lowercase, number)
validatePassword(value: string): string | undefined

// Name validation (2-50 chars)
validateName(value: string): string | undefined

// Email or Username (for login)
validateEmailOrUsername(value: string): string | undefined

// Confirm password match
validateConfirmPassword(password: string, confirmPassword: string): string | undefined
```

#### Zod Schemas

```typescript
// Pre-defined schemas
emailSchema
usernameSchema
passwordSchema
nameSchema
loginFormSchema
registerFormSchema
forgotPasswordFormSchema

// Type exports
type LoginFormData = z.infer<typeof loginFormSchema>;
type RegisterFormData = z.infer<typeof registerFormSchema>;
```

## Implementation Examples

### Login Screen Example

**Location**: `app/(auth)/login.tsx`

```tsx
import { validateEmailOrUsername } from '@/utils/validation';

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const handleLogin = async () => {
    // Validate inputs
    const emailValidationError = validateEmailOrUsername(email);
    const passwordValidationError = password ? undefined : 'Password is required';

    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);
    setShowValidationErrors(true);

    // If validation fails, don't proceed
    if (emailValidationError || passwordValidationError) {
      return;
    }

    // Proceed with login...
  };

  return (
    <Input
      placeholder="Email or Username"
      value={email}
      onChangeText={setEmail}
      error={showValidationErrors ? emailError : undefined}
      onValidate={validateEmailOrUsername}
      validateOnBlur={true}
    />
  );
};
```

### Register Screen Example

**Location**: `app/(auth)/register.tsx`

```tsx
import { validateEmail, validateName, validatePassword, validateConfirmPassword } from '@/utils/validation';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState<string | undefined>();
  const [nameError, setNameError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const handleRegister = async () => {
    // Validate all inputs
    const emailValidationError = validateEmail(email);
    const nameValidationError = validateName(fullName);
    const passwordValidationError = validatePassword(password);
    const confirmPasswordValidationError = validateConfirmPassword(password, confirmPassword);

    setEmailError(emailValidationError);
    setNameError(nameValidationError);
    setPasswordError(passwordValidationError);
    setConfirmPasswordError(confirmPasswordValidationError);
    setShowValidationErrors(true);

    // If any validation fails, don't proceed
    if (emailValidationError || nameValidationError || passwordValidationError || confirmPasswordValidationError) {
      return;
    }

    // Proceed with registration...
  };

  return (
    <>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        error={showValidationErrors ? emailError : undefined}
        onValidate={validateEmail}
        validateOnBlur={true}
      />

      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        isPassword
        error={showValidationErrors ? passwordError : undefined}
        onValidate={validatePassword}
        validateOnBlur={true}
      />

      <Input
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        isPassword
        error={showValidationErrors ? confirmPasswordError : undefined}
        onValidate={(value) => validateConfirmPassword(password, value)}
        validateOnBlur={true}
      />
    </>
  );
};
```

## Styling

### Input Styles

```typescript
// Container with error spacing
container: {
  width: '100%',
  marginBottom: 4,  // Reduced to accommodate error messages
}

// Input wrapper with border and shadow
inputWrapper: {
  borderRadius: 12,
  overflow: 'hidden',
  shadowColor: 'rgba(0,0,0,0.25)',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 4,
  elevation: 3,
}

// Gradient background
gradientBackground: {
  borderRadius: 12,
  position: 'relative',
  colors: ['rgba(49,49,58,0.2)', 'rgba(0,0,0,0.12)']
}

// Error message
errorContainer: {
  paddingHorizontal: 4,
  paddingTop: 6,
  paddingBottom: 10,
}

errorText: {
  color: '#ff4d4f',
  fontSize: 12,
  fontWeight: '400',
  opacity: 0.9,
}
```

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Default Border | `rgba(255,255,255,0.08)` | Unfocused input, no errors |
| Focused Border | `#667eea` | Active input |
| Error Border | `#ff4d4f` | Validation error |
| Error Text | `#ff4d4f` | Error messages |
| Placeholder | `#A6A6B9` | Input placeholder |
| Error Placeholder | `#ff8080` | Placeholder in error state |
| Error Input Text | `#ffb3b3` | Input text in error state |

## Animation Details

### Border Color Transition

```typescript
Animated.spring(borderColorAnim, {
  toValue: targetValue,
  useNativeDriver: false,
  friction: 8,      // Smooth damping
  tension: 40,      // Moderate speed
})
```

### Error Message Animation

```typescript
// Fade in + expand
Animated.parallel([
  Animated.timing(errorOpacityAnim, {
    toValue: 1,
    duration: 200,
    useNativeDriver: false,
  }),
  Animated.timing(errorHeightAnim, {
    toValue: 1,
    duration: 200,
    useNativeDriver: false,
  }),
])
```

## Validation Rules

### Email
- Required
- Must be valid email format

### Username
- 3-20 characters
- Only letters, numbers, and underscores
- Example: `john_doe123`

### Password
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Example: `MyPass123`

### Name
- 2-50 characters
- Any characters allowed

## Best Practices

1. **Always use `showValidationErrors` flag** to control when errors appear
   - Don't show errors immediately on mount
   - Only show after user attempts to submit or after blur

2. **Validate on blur for better UX** rather than on every keystroke
   - Use `validateOnBlur={true}` (default)
   - Only use `validateOnChange={true}` for real-time requirements

3. **Clear errors when user starts typing**
   - Component handles this automatically

4. **Keep buttons enabled** to allow validation on press
   - Don't disable based on empty fields
   - Let validation show specific errors

5. **Provide clear, specific error messages**
   - "Email is required" not "Invalid input"
   - "Password must be at least 8 characters" not "Wrong password"

## Troubleshooting

### Error messages not showing
- Check that `showValidationErrors` is `true`
- Verify `error` prop is passed correctly
- Ensure validation function returns error string

### Border not changing color
- Verify React Native Animated is imported
- Check that `borderColor` is being applied
- Ensure `useNativeDriver: false` for color animations

### Validation not triggering
- Confirm `onValidate` function is passed
- Check `validateOnBlur` or `validateOnChange` props
- Verify validation function syntax

## Behavior Summary

**Input Border States:**
- **Unfocused + No Error** → Default white border `rgba(255,255,255,0.08)`
- **Focused** → Blue border `#667eea` (regardless of error state)
- **Unfocused + Error** → Red border `#ff4d4f` with error message below
- **Error Corrected** → Returns to default white border (no green/success state)

**Why no "valid" green state?**
The design uses a minimal approach where valid inputs simply return to the default state. This prevents visual clutter and keeps the UI clean. Errors are highlighted in red, but correct data doesn't need extra emphasis.

## Future Enhancements

- [ ] Optional success icon on valid state (if desired)
- [ ] Haptic feedback on validation errors
- [ ] Custom validation messages per field type
- [ ] Accessibility improvements (screen readers)
- [ ] Custom animation curves
- [ ] Optional success glow effect (configurable)

---

**Last Updated**: 2025-10-18
**Version**: 1.0.0
