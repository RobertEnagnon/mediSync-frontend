import { API_BASE_URL, getAuthToken } from './config';

export interface NotificationData {
  appointmentId?: string;
  date?: string;
  oldDate?: string;
  newDate?: string;
  type?: string;
  reason?: string;
  documentId?: string;
  fileName?: string;
  invoiceId?: string;
  number?: string;
  amount?: number;
}

export interface INotification {
  id: string;
  type: 'APPOINTMENT_REMINDER' | 'APPOINTMENT_CANCELLATION' | 'APPOINTMENT_MODIFICATION' |
        'NEW_DOCUMENT' | 'NEW_INVOICE' | 'INVOICE_PAID' | 'INVOICE_OVERDUE' |
        'BIRTHDAY_REMINDER' | 'INACTIVITY_ALERT' | 'SYSTEM_NOTIFICATION';
  title: string;
  message: string;
  data?: NotificationData;
  read: boolean;
  createdAt: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  expiresAt?: string;
}

export interface NotificationResponse {
  notifications: INotification[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  unreadCount: number;
}

class NotificationService {
  private getHeaders() {
    return {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    };
  }

  async getNotifications(page: number = 1, limit: number = 10): Promise<NotificationResponse> {
    const response = await fetch(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des notifications');
    }

    return response.json();
  }

  async markAsRead(id: string): Promise<INotification> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du marquage de la notification comme lue');
    }

    return response.json();
  }

  async markAllAsRead(): Promise<{ count: number }> {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du marquage de toutes les notifications comme lues');
    }

    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la suppression de la notification');
    }
  }

  async deleteReadNotifications(): Promise<{ count: number }> {
    const response = await fetch(`${API_BASE_URL}/notifications/delete-read`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la suppression des notifications lues');
    }

    return response.json();
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération du nombre de notifications non lues');
    }

    return response.json();
  }
}

export default new NotificationService();
