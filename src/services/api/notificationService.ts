import { API_BASE_URL, headers, handleResponse, getAuthToken } from './config';

import { 
  INotification, 
  NotificationResponse, 
  DeleteReadNotificationsResponse 
} from '../../types/notification';

/**
 * Service pour la gestion des notifications
 */
class NotificationService {
  private readonly baseUrl = '/notifications';
  
  private getHeaders() {
    const token = getAuthToken();
    return {
      ...headers,
      Authorization: `Bearer ${token}`
    };
  }

  /**
   * Récupère toutes les notifications avec pagination
   */
  async getAll(page: number = 1, limit: number = 10): Promise<NotificationResponse> {
    const response = await fetch(
      `${API_BASE_URL}${this.baseUrl}?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders()
      }
    );
    const data = await handleResponse<NotificationResponse>(response);
    return {
      ...data,
      notifications: data.notifications.map(notification => ({
        ...notification,
        createdAt: new Date(notification.createdAt),
        expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined,
        data: notification.data ? {
          ...notification.data,
          date: notification.data.date ? new Date(notification.data.date) : undefined,
          oldDate: notification.data.oldDate ? new Date(notification.data.oldDate) : undefined,
          newDate: notification.data.newDate ? new Date(notification.data.newDate) : undefined,
        } : undefined
      }))
    };
  }

  /**
   * Récupère les notifications non lues
   */
  async getUnread(): Promise<INotification[]> {
    const response = await fetch(
      `${API_BASE_URL}${this.baseUrl}/unread`,
      {
        headers: this.getHeaders()
      }
    );
    const data = await handleResponse<INotification[]>(response);
    return data.map(notification => ({
      ...notification,
      createdAt: new Date(notification.createdAt),
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined,
      data: notification.data ? {
        ...notification.data,
        date: notification.data.date ? new Date(notification.data.date) : undefined,
        oldDate: notification.data.oldDate ? new Date(notification.data.oldDate) : undefined,
        newDate: notification.data.newDate ? new Date(notification.data.newDate) : undefined,
      } : undefined
    }));
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(id: string): Promise<INotification> {
    const response = await fetch(
      `${API_BASE_URL}${this.baseUrl}/${id}/read`,
      {
        method: 'PUT',
        headers: this.getHeaders()
      }
    );
    const notification = await handleResponse<INotification>(response);
    return {
      ...notification,
      createdAt: new Date(notification.createdAt),
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined,
      data: notification.data ? {
        ...notification.data,
        date: notification.data.date ? new Date(notification.data.date) : undefined,
        oldDate: notification.data.oldDate ? new Date(notification.data.oldDate) : undefined,
        newDate: notification.data.newDate ? new Date(notification.data.newDate) : undefined,
      } : undefined
    };
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}${this.baseUrl}/read-all`,
      {
        method: 'PUT',
        headers: this.getHeaders()
      }
    );
    await handleResponse(response);
  }

  /**
   * Supprime une notification
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}${this.baseUrl}/${id}`,
      {
        method: 'DELETE',
        headers: this.getHeaders()
      }
    );
    await handleResponse(response);
  }

  /**
   * Supprime toutes les notifications lues
   */
  async deleteReadNotifications(): Promise<DeleteReadNotificationsResponse> {
    const response = await fetch(
      `${API_BASE_URL}${this.baseUrl}/read`,
      {
        method: 'DELETE',
        headers: this.getHeaders()
      }
    );
    return handleResponse<DeleteReadNotificationsResponse>(response);
  }

  /**
   * Étend la durée de vie d'une notification
   */
  async extendExpiration(id: string, days: number): Promise<INotification> {
    const response = await fetch(
      `${API_BASE_URL}${this.baseUrl}/${id}/extend`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ days })
      }
    );
    const notification = await handleResponse<INotification>(response);
    return {
      ...notification,
      createdAt: new Date(notification.createdAt),
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined,
      data: notification.data ? {
        ...notification.data,
        date: notification.data.date ? new Date(notification.data.date) : undefined,
        oldDate: notification.data.oldDate ? new Date(notification.data.oldDate) : undefined,
        newDate: notification.data.newDate ? new Date(notification.data.newDate) : undefined,
      } : undefined
    };
  }
}

export const notificationService =  new NotificationService();
