import { z } from 'zod';

// Zod schemas for authentication forms
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const emailOrUsernameSchema = z.string().min(1, 'Email or username is required');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters');

// Validation helper functions for Input component
export const validateEmail = (value: string): string | undefined => {
  try {
    emailSchema.parse(value);
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message;
    }
    return 'Invalid email';
  }
};

export const validateUsername = (value: string): string | undefined => {
  try {
    usernameSchema.parse(value);
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message;
    }
    return 'Invalid username';
  }
};

export const validatePassword = (value: string): string | undefined => {
  try {
    passwordSchema.parse(value);
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message;
    }
    return 'Invalid password';
  }
};

export const validateEmailOrUsername = (value: string): string | undefined => {
  try {
    emailOrUsernameSchema.parse(value);
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message;
    }
    return 'This field is required';
  }
};

export const validateName = (value: string): string | undefined => {
  try {
    nameSchema.parse(value);
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message;
    }
    return 'Invalid name';
  }
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return undefined;
};

// Form validation schemas
export const loginFormSchema = z.object({
  emailOrUsername: emailOrUsernameSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordFormSchema = z.object({
  email: emailSchema,
});

// Type exports
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;
