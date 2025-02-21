import { API_BASE_URL, headers, handleResponse, getAuthToken } from './config';

export interface INotification {
  _id: string;
  userId: string;
  type: 'appointment' | 'client' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

/**
 * Service pour la gestion des notifications
 */
class NotificationService {
  private getHeaders() {
    const token = getAuthToken();
    return {
      ...headers,
      Authorization: `Bearer ${token}`
    };
  }

  /**
   * Récupère toutes les notifications
   */
  async getAll(): Promise<INotification[]> {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(id: string): Promise<INotification> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Supprime une notification
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Supprime toutes les notifications
   */
  async deleteAll(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Récupère le nombre de notifications non lues
   */
  async getUnreadCount(): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }
}

export const notificationService = new NotificationService();
