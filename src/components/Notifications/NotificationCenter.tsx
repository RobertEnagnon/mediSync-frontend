import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  CheckCheck,
  Calendar,
  FileText,
  Receipt
} from 'lucide-react';
import { INotification, NotificationResponse, NotificationData } from '../../types/notification';
import { notificationService } from '../../services/api/notificationService';
import { useToast } from '../../hooks/use-toast';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'APPOINTMENT_REMINDER':
    case 'APPOINTMENT_MODIFICATION':
    case 'APPOINTMENT_CANCELLATION':
      return <Calendar className="h-4 w-4" />;
    case 'NEW_DOCUMENT':
      return <FileText className="h-4 w-4" />;
    case 'NEW_INVOICE':
    case 'INVOICE_PAID':
    case 'INVOICE_OVERDUE':
      return <Receipt className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const NotificationContent: React.FC<{ data: NotificationData }> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="mt-1 text-sm">
      {data.appointmentId && (
        <p className="text-sm text-gray-500">
          {data.date && (
            <>RDV le {new Date(data.date).toLocaleString()}</>
          )}
          {data.reason && (
            <> - {data.reason}</>
          )}
        </p>
      )}
      {data.invoiceId && (
        <p className="text-sm text-gray-500">
          Facture n°{data.number}
          {data.amount && (
            <> - {data.amount.toLocaleString()}€</>
          )}
        </p>
      )}
      {data.documentId && (
        <p className="text-sm text-gray-500">
          Document : {data.fileName}
        </p>
      )}
    </div>
  );
};

const NotificationItem: React.FC<{
  notification: INotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ notification, onMarkAsRead, onDelete }) => {
  const getNotificationColor = (type: string, severity: string) => {
    // Priorité à la sévérité pour la couleur
    switch (severity) {
      case 'error':
        return 'bg-red-100 border-red-200';
      case 'warning':
        return 'bg-orange-100 border-orange-200';
      case 'success':
        return 'bg-green-100 border-green-200';
      case 'info':
        return 'bg-blue-100 border-blue-200';
      default:
        // Fallback sur le type si pas de sévérité
        switch (type) {
          case 'APPOINTMENT_REMINDER':
          case 'APPOINTMENT_MODIFICATION':
            return 'bg-blue-100 border-blue-200';
          case 'APPOINTMENT_CANCELLATION':
            return 'bg-red-100 border-red-200';
          case 'NEW_DOCUMENT':
          case 'NEW_INVOICE':
          case 'INVOICE_PAID':
            return 'bg-green-100 border-green-200';
          case 'INVOICE_OVERDUE':
          case 'INACTIVITY_ALERT':
            return 'bg-orange-100 border-orange-200';
          default:
            return 'bg-gray-100 border-gray-200';
        }
    }
  };

  return (
    <div 
      className={`p-4 mb-2 rounded-lg border ${getNotificationColor(notification.type, notification.severity)} ${
        !notification.isRead ? 'border-l-4' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <NotificationIcon type={notification.type} />
            <h4 className="font-semibold">{notification.title}</h4>
          </div>
          <p className="text-sm text-gray-600">{notification.message}</p>
          <NotificationContent data={notification.data} />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              {new Date(notification.createdAt).toLocaleString()}
            </span>
            {notification.expiresAt && (
              <span className="text-xs text-gray-500">
                - Expire le {new Date(notification.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
              title="Marquer comme lu"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(notification.id)}
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Centre de notifications principal
 */
export const NotificationCenter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [notificationData, setNotificationData] = useState<NotificationResponse>({
    notifications: [],
    currentPage: 1,
    totalPages: 1,
    totalNotifications: 0
  });
  const [unreadNotifications, setUnreadNotifications] = useState<INotification[]>([]);
  const { toast } = useToast();

  const fetchNotifications = async (page: number = 1) => {
    try {
      setLoading(true);
      const data = await notificationService.getAll(page);
      setNotificationData(data);
      const unread = await notificationService.getUnread();
      setUnreadNotifications(unread);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications(notificationData.currentPage);
      toast({
        description: "Notification marquée comme lue"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue",
        variant: "destructive"
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications(notificationData.currentPage);
      toast({
        description: "Toutes les notifications ont été marquées comme lues"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer les notifications comme lues",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.delete(id);
      fetchNotifications(notificationData.currentPage);
      toast({
        description: "Notification supprimée"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRead = async () => {
    try {
      const result = await notificationService.deleteReadNotifications();
      fetchNotifications(notificationData.currentPage);
      toast({
        description: `${result.count} notifications lues supprimées`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les notifications lues",
        variant: "destructive"
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= notificationData.totalPages) {
      fetchNotifications(newPage);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            {unreadNotifications.length > 0 && (
              <Badge variant="secondary">
                {unreadNotifications.length} non lues
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNotifications(notificationData.currentPage)}
              title="Rafraîchir"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadNotifications.length === 0}
              title="Tout marquer comme lu"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteRead}
              title="Supprimer les notifications lues"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="mb-4">
                <Skeleton className="h-24 w-full" />
              </div>
            ))
          ) : notificationData.notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune notification
            </div>
          ) : (
            notificationData.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))
          )}
        </ScrollArea>
      </CardContent>

      {notificationData.totalPages > 1 && (
        <CardFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(notificationData.currentPage - 1)}
            disabled={notificationData.currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {notificationData.currentPage} sur {notificationData.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(notificationData.currentPage + 1)}
            disabled={notificationData.currentPage === notificationData.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
