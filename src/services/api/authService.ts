import { API_BASE_URL, headers, handleResponse, getAuthToken } from './config';
import {
  IUser,
  LoginCredentials,
  RegisterData,
  UpdateUserData,
  ChangePasswordData,
  ResetPasswordData,
  ForgotPasswordData,
  VerifyEmailData,
  AuthResponse,
  UserResponse
} from '../../types/user';

/**
 * Service pour la gestion de l'authentification
 */
class AuthService {
  private readonly baseUrl = '/auth';

  private getHeaders() {
    const token = getAuthToken();
    return {
      ...headers,
      Authorization: `Bearer ${token}`
    };
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}${this.baseUrl}/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
        headers: this.getHeaders()
    });
    const data = await handleResponse<AuthResponse>(response);
    this.setAuthToken(data.token);
    return data;
  }

  /**
   * Inscription d'un utilisateur
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}${this.baseUrl}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
        headers: this.getHeaders()
    });
    return await handleResponse<AuthResponse>(response);
  }

  /**
   * Vérification de l'email
   */
  // async verifyEmail(data: VerifyEmailData): Promise<void> {
  async verifyEmail(token): Promise<void> {
    await fetch(`${API_BASE_URL}${this.baseUrl}/verify-email/${token}`, {
      method: 'GET',
        headers: this.getHeaders()
    });
  }

  /**
   * Demande de réinitialisation du mot de passe
   */
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await fetch(`${API_BASE_URL}${this.baseUrl}/forgot-password`, {
      method: 'POST',
      body: JSON.stringify(data),
        headers: this.getHeaders()
    });
  }

  /**
   * Réinitialisation du mot de passe
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    await fetch(`${API_BASE_URL}${this.baseUrl}/reset-password`, {
      method: 'POST',
      body: JSON.stringify(data),
        headers: this.getHeaders()
    });
  }

  /**
   * Changement de mot de passe
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await fetch(`${API_BASE_URL}${this.baseUrl}/change-password`, {
      method: 'POST',
      body: JSON.stringify(data),
        headers: this.getHeaders()
    });
  }

  /**
   * Récupération du profil utilisateur
   */
  async getProfile(): Promise<UserResponse> {
    const response = await fetch<UserResponse>(`${API_BASE_URL}${this.baseUrl}/profile`,{
        headers: this.getHeaders()
    });
    return await handleResponse<UserResponse>(response);
  }

  /**
   * Mise à jour du profil utilisateur
   */
  async updateProfile(data: UpdateUserData): Promise<UserResponse> {
    const response = await fetch<UserResponse>(`${API_BASE_URL}${this.baseUrl}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
        headers: this.getHeaders()
    });
    return await handleResponse<UserResponse>(response);
  }

  /**
   * Mise à jour des paramètres utilisateur
   */
  async updateSettings(settings: UpdateUserData['settings']): Promise<UserResponse> {
    const response = await fetch<UserResponse>(`${API_BASE_URL}${this.baseUrl}/settings`, {
      method: 'POST',
      body: JSON.stringify({ settings }),
        headers: this.getHeaders()
    } );
    return await handleResponse<UserResponse>(response);
  }

  /**
   * Vérification du token
   */
  async verifyToken(): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL}${this.baseUrl}/verify`,{
        headers:this.getHeaders()
      });
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Stockage du token d'authentification
   */
  private setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Récupération du token d'authentification
   */
  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Vérification si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export default  new AuthService();
