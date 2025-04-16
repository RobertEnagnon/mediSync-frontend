import { useState, useEffect, useCallback } from 'react';
import { INotification } from '@/services/api/notificationService';
import WebSocketService from '@/services/websocket/WebSocketService';
import { useToast } from '@/components/ui/use-toast';

export const useNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ws = WebSocketService;

  const handleNewNotification = useCallback((notification: INotification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Afficher une notification toast
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.severity === 'error' ? 'destructive' : 'default',
    });
  }, [toast]);

  useEffect(() => {
    // Connecter au WebSocket
    ws.connect();

    // S'abonner aux notifications
    ws.on('notification', handleNewNotification);

    // S'abonner aux événements de connexion
    ws.on('connect', () => {
      console.log('Connected to notifications');
    });

    ws.on('disconnect', () => {
      console.log('Disconnected from notifications');
    });

    ws.on('connect_error', (error) => {
      console.error('Notification connection error:', error);
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de se connecter au serveur de notifications',
        variant: 'destructive',
      });
    });

    // Nettoyer lors du démontage
    return () => {
      ws.off('notification', handleNewNotification);
      ws.off('connect', () => console.log('Connected to notifications'));
      ws.off('disconnect', () => console.log('Disconnected from notifications'));
      ws.off('connect_error', (error) => console.error('Notification connection error:', error));
      ws.disconnect();
    };
  }, [handleNewNotification, toast]);

  return {
    notifications,
    unreadCount,
  };
};

export default useNotifications;
