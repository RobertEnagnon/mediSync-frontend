import { API_BASE_URL, headers, handleResponse, getAuthToken } from './config';

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export type UpdateUserDto = Partial<Omit<IUser, '_id' | 'role' | 'createdAt' | 'updatedAt'>>;

/**
 * Service pour la gestion des utilisateurs
 */
class UserService {
  private getHeaders() {
    const token = getAuthToken();
    return {
      ...headers,
      Authorization: `Bearer ${token}`
    };
  }

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  async getProfile(): Promise<IUser> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Met à jour le profil de l'utilisateur connecté
   */
  async updateProfile(data: UpdateUserDto): Promise<IUser> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }

  /**
   * Change le mot de passe de l'utilisateur connecté
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse(response);
  }

  /**
   * Récupère les préférences de l'utilisateur
   */
  async getPreferences(): Promise<Record<string, any>> {
    const response = await fetch(`${API_BASE_URL}/users/preferences`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Met à jour les préférences de l'utilisateur
   */
  async updatePreferences(preferences: Record<string, any>): Promise<Record<string, any>> {
    const response = await fetch(`${API_BASE_URL}/users/preferences`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(preferences)
    });
    return handleResponse(response);
  }

  /**
   * Récupère l'historique des activités de l'utilisateur
   */
  async getActivityHistory(): Promise<{
    type: string;
    action: string;
    details: Record<string, any>;
    timestamp: Date;
  }[]> {
    const response = await fetch(`${API_BASE_URL}/users/activity-history`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }
}

export default new UserService();
