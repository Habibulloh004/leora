import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterCredentials, ForgotPasswordData } from '@/types/auth.types';

interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  error: string | null;
  pendingPasswordResetEmail: string | null;
  passwordResetOtp: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  sendPasswordResetCode: (email: string) => Promise<boolean>;
  verifyPasswordResetOtp: (otp: string) => Promise<boolean>;
  resetPassword: (newPassword: string) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  setRememberMe: (value: boolean) => void;

  // Helpers
  validateEmail: (email: string) => boolean;
  validatePassword: (password: string) => { valid: boolean; message?: string };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      rememberMe: false,
      error: null,
      pendingPasswordResetEmail: null,
      passwordResetOtp: null,

      // Login action
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { emailOrUsername, password, rememberMe } = credentials;

          // Validate input
          if (!emailOrUsername || !password) {
            set({ error: 'Please enter both email/username and password', isLoading: false });
            return false;
          }

          // Get all registered users from AsyncStorage
          const usersJson = await AsyncStorage.getItem('registered-users');
          const users: User[] = usersJson ? JSON.parse(usersJson) : [];

          // Find user by email or username
          const user = users.find(
            (u) =>
              u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
              u.username?.toLowerCase() === emailOrUsername.toLowerCase()
          );

          if (!user) {
            set({ error: 'Invalid email/username or password', isLoading: false });
            return false;
          }

          // Check password (in real app, this would be hashed)
          const passwordJson = await AsyncStorage.getItem(`user-password-${user.id}`);
          const storedPassword = passwordJson ? JSON.parse(passwordJson) : null;

          if (storedPassword !== password) {
            set({ error: 'Invalid email/username or password', isLoading: false });
            return false;
          }

          // Successful login
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            rememberMe: rememberMe || false,
          });

          return true;
        } catch (error) {
          set({
            error: 'An error occurred during login. Please try again.',
            isLoading: false,
          });
          return false;
        }
      },

      // Register action
      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { emailOrPhone, fullName, password, confirmPassword } = credentials;

          // Validate input
          if (!emailOrPhone || !fullName || !password || !confirmPassword) {
            set({ error: 'Please fill in all fields', isLoading: false });
            return false;
          }

          if (password !== confirmPassword) {
            set({ error: 'Passwords do not match', isLoading: false });
            return false;
          }

          // Validate password strength
          const passwordValidation = get().validatePassword(password);
          if (!passwordValidation.valid) {
            set({ error: passwordValidation.message, isLoading: false });
            return false;
          }

          // Check if email is valid (if it's an email)
          const isEmail = emailOrPhone.includes('@');
          if (isEmail && !get().validateEmail(emailOrPhone)) {
            set({ error: 'Please enter a valid email address', isLoading: false });
            return false;
          }

          // Get existing users
          const usersJson = await AsyncStorage.getItem('registered-users');
          const users: User[] = usersJson ? JSON.parse(usersJson) : [];

          // Check if user already exists
          const existingUser = users.find((u) => u.email.toLowerCase() === emailOrPhone.toLowerCase());
          if (existingUser) {
            set({ error: 'An account with this email already exists', isLoading: false });
            return false;
          }

          // Create new user
          const newUser: User = {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            email: isEmail ? emailOrPhone : '',
            phoneNumber: !isEmail ? emailOrPhone : undefined,
            fullName,
            username: emailOrPhone.split('@')[0] || fullName.toLowerCase().replace(/\s+/g, ''),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Save user to storage
          users.push(newUser);
          await AsyncStorage.setItem('registered-users', JSON.stringify(users));

          // Store password separately (in real app, this would be hashed on backend)
          await AsyncStorage.setItem(`user-password-${newUser.id}`, JSON.stringify(password));

          // Auto-login after registration
          set({
            user: newUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          set({
            error: 'An error occurred during registration. Please try again.',
            isLoading: false,
          });
          return false;
        }
      },

      // Logout action
      logout: async () => {
        try {
          const { rememberMe } = get();

          // If remember me is disabled, clear user data
          if (!rememberMe) {
            await AsyncStorage.removeItem('auth-storage');
          }

          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      // Send password reset code
      sendPasswordResetCode: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Validate email
          if (!get().validateEmail(email)) {
            set({ error: 'Please enter a valid email address', isLoading: false });
            return false;
          }

          // Check if user exists
          const usersJson = await AsyncStorage.getItem('registered-users');
          const users: User[] = usersJson ? JSON.parse(usersJson) : [];
          const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

          if (!user) {
            // For security, we don't reveal if email exists or not
            // But we still show success message
            set({
              pendingPasswordResetEmail: email,
              isLoading: false,
            });
            return true;
          }

          // Generate OTP (in real app, this would be sent via email)
          const otp = Math.floor(1000 + Math.random() * 9000).toString();
          console.log('Password reset OTP:', otp); // For testing

          // Store OTP temporarily
          await AsyncStorage.setItem('password-reset-otp', JSON.stringify({ email, otp, timestamp: Date.now() }));

          set({
            pendingPasswordResetEmail: email,
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({
            error: 'An error occurred. Please try again.',
            isLoading: false,
          });
          return false;
        }
      },

      // Verify password reset OTP
      verifyPasswordResetOtp: async (otp: string) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          const otpDataJson = await AsyncStorage.getItem('password-reset-otp');
          if (!otpDataJson) {
            set({ error: 'OTP expired or invalid', isLoading: false });
            return false;
          }

          const otpData = JSON.parse(otpDataJson);

          // Check if OTP is expired (5 minutes)
          const isExpired = Date.now() - otpData.timestamp > 5 * 60 * 1000;
          if (isExpired) {
            await AsyncStorage.removeItem('password-reset-otp');
            set({ error: 'OTP has expired. Please request a new one.', isLoading: false });
            return false;
          }

          // Verify OTP
          if (otpData.otp !== otp) {
            set({ error: 'Invalid OTP code', isLoading: false });
            return false;
          }

          set({
            passwordResetOtp: otp,
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({
            error: 'An error occurred. Please try again.',
            isLoading: false,
          });
          return false;
        }
      },

      // Reset password
      resetPassword: async (newPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          const { pendingPasswordResetEmail, passwordResetOtp } = get();

          if (!pendingPasswordResetEmail || !passwordResetOtp) {
            set({ error: 'Invalid password reset session', isLoading: false });
            return false;
          }

          // Validate password
          const passwordValidation = get().validatePassword(newPassword);
          if (!passwordValidation.valid) {
            set({ error: passwordValidation.message, isLoading: false });
            return false;
          }

          // Get user
          const usersJson = await AsyncStorage.getItem('registered-users');
          const users: User[] = usersJson ? JSON.parse(usersJson) : [];
          const user = users.find((u) => u.email.toLowerCase() === pendingPasswordResetEmail.toLowerCase());

          if (!user) {
            set({ error: 'User not found', isLoading: false });
            return false;
          }

          // Update password
          await AsyncStorage.setItem(`user-password-${user.id}`, JSON.stringify(newPassword));

          // Clear password reset data
          await AsyncStorage.removeItem('password-reset-otp');
          set({
            pendingPasswordResetEmail: null,
            passwordResetOtp: null,
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({
            error: 'An error occurred. Please try again.',
            isLoading: false,
          });
          return false;
        }
      },

      // Update user profile
      updateUser: (updates: Partial<User>) => {
        set((state) => {
          if (!state.user) return state;

          const updatedUser = {
            ...state.user,
            ...updates,
            updatedAt: new Date(),
          };

          // Update in storage
          AsyncStorage.getItem('registered-users').then((usersJson) => {
            const users: User[] = usersJson ? JSON.parse(usersJson) : [];
            const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
            AsyncStorage.setItem('registered-users', JSON.stringify(updatedUsers));
          });

          return { user: updatedUser };
        });
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Set remember me
      setRememberMe: (value: boolean) => set({ rememberMe: value }),

      // Email validation helper
      validateEmail: (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },

      // Password validation helper
      validatePassword: (password: string) => {
        if (password.length < 6) {
          return { valid: false, message: 'Password must be at least 6 characters long' };
        }
        // Add more validation rules as needed
        return { valid: true };
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // Persist only specific fields
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
);
