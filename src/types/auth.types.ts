export interface User {
  id: string;
  email: string;
  fullName: string;
  username?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  profileImage?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  error: string | null;
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  emailOrPhone: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
  otp?: string;
  newPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}
