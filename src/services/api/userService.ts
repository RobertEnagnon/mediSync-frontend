import { API_BASE_URL, getAuthToken } from './config';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  specialization?: string;
  phoneNumber?: string;
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  lastLogin?: string;
  isVerified: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  specialization?: string;
  phoneNumber?: string;
}

class UserService {
  private getHeaders() {
    return {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    };
  }

  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération du profil');
    }

    return response.json();
  }

  async updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour du profil');
    }

    return response.json();
  }

  async getSettings(): Promise<UserSettings> {
    const response = await fetch(`${API_BASE_URL}/users/settings`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des paramètres');
    }

    return response.json();
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await fetch(`${API_BASE_URL}/users/settings`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour des paramètres');
    }

    return response.json();
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/password`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du changement de mot de passe');
    }
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du téléchargement de l\'avatar');
    }

    return response.json();
  }
}

export default new UserService();
