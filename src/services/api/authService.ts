import { API_BASE_URL, headers, handleResponse } from './config';

export interface AuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  token: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Service pour la gestion de l'authentification
 */
class AuthService {
  /**
   * Connexion d'un utilisateur
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }

  /**
   * Inscription d'un utilisateur
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }

  /**
   * Vérification du token
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`
        }
      });
      await handleResponse(response);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Mise à jour du profil
   */
  async updateProfile(data: Partial<Omit<RegisterData, 'password'>>, token: string): Promise<AuthResponse['user']> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }

  /**
   * Changement de mot de passe
   */
  async changePassword(currentPassword: string, newPassword: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse(response);
  }
}

export default new AuthService();
