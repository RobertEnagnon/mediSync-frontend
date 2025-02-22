/**
 * Types de notifications supportés par l'application
 */
export type NotificationType = 
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CANCELLATION'
  | 'APPOINTMENT_MODIFICATION'
  | 'NEW_DOCUMENT'
  | 'NEW_INVOICE'
  | 'INVOICE_PAID'
  | 'INVOICE_OVERDUE'
  | 'BIRTHDAY_REMINDER'
  | 'INACTIVITY_ALERT'
  | 'SYSTEM_NOTIFICATION';

export type NotificationSeverity = 'info' | 'warning' | 'success' | 'error';

export interface NotificationData {
  appointmentId?: string;
  date?: Date;
  oldDate?: Date;
  newDate?: Date;
  type?: string;
  reason?: string;
  documentId?: string;
  fileName?: string;
  invoiceId?: string;
  number?: string;
  amount?: number;
}

/**
 * Interface représentant une notification
 */
export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  isRead: boolean;
  createdAt: Date;
  severity: NotificationSeverity;
  expiresAt?: Date;
}

/**
 * Interface pour la pagination des notifications
 */
export interface NotificationResponse {
  notifications: INotification[];
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
}

export interface DeleteReadNotificationsResponse {
  count: number;
  message: string;
}
