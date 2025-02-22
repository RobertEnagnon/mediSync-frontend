export type UserRole = 'admin' | 'practitioner' | 'assistant';

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: 'fr' | 'en';
}

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  specialization?: string;
  phoneNumber?: string;
  settings: UserSettings;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  specialization?: string;
  phoneNumber?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  specialization?: string;
  phoneNumber?: string;
  settings?: Partial<UserSettings>;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface AuthResponse {
  user: IUser;
  token: string;
}

export interface UserResponse {
  user: IUser;
}
