import { useState, useEffect, useCallback } from 'react';
import notificationService, { INotification } from '@/services/api/notificationService';
import WebSocketService from '@/services/websocket/WebSocketService';
import { useToast } from '@/components/ui/use-toast';

export const useNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ws = WebSocketService;

  // Charger les notifications depuis l'API
  const fetchNotifications = useCallback(async (page: number = 1) => {
    try {
      console.log(`🔍 useNotifications - Chargement des notifications (page ${page})`);
      setLoading(true);
      const response = await notificationService.getNotifications(page);
      console.log('💬 Réponse du serveur:', response);
      
      setNotifications(prev => {
        const newState = page === 1 ? response.notifications : [...prev, ...response.notifications];
        console.log(`📁 État des notifications mis à jour (${newState.length} notifications)`);
        return newState;
      });
      setUnreadCount(response.unreadCount);
      setCurrentPage(page);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Gérer les nouvelles notifications WebSocket
  const handleNewNotification = useCallback((notification: INotification) => {
    console.log('🔔 useNotifications hook received notification:', notification);
    
    // Vérifier si la notification existe déjà (pour éviter les doublons)
    setNotifications(prev => {
      // Vérifier si cette notification existe déjà dans notre liste
      const notificationExists = prev.some(n => 
        (n.id && n.id === notification._id) || (n._id && n._id === notification._id)
      );
      
      if (notificationExists) {
        console.log('🚫 Notification déjà existante, ignorée');
        return prev;
      }
      
      console.log('💾 Ajout de la nouvelle notification dans l\'état local');
      return [notification, ...prev];
    });
    
    // Incrémenter le compteur de notifications non lues
    setUnreadCount(prev => prev + 1);
    
    // Afficher une notification toast
    console.log('🚀 Affichage du toast avec titre:', notification.title);
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.severity === 'error' ? 'destructive' : 'default',
    });
  }, [toast]);

  useEffect(() => {
    // Charger les notifications initiales
    fetchNotifications();
    
    // Connecter au WebSocket
    console.log('🔄 useNotifications initie la connexion WebSocket');
    ws.connect();

    // S'abonner aux notifications
    console.log('👂 useNotifications s\'abonne à l\'événement "notification"');
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
  }, [handleNewNotification, fetchNotifications, toast]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (id: string) => {
    try {
      console.log(`🔎 useNotifications - Marquage comme lu de la notification ${id}`);
      await notificationService.markAsRead(id);

      setNotifications(prev => {
        return prev.map(notif => {
          if (notif.id === id || notif._id === id) {
            return { ...notif, read: true };
          }
          return notif;
        });
      });

      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      return false;
    }
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
      return result;
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error);
      return { count: 0 };
    }
  }, []);

  // Supprimer une notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(notif => !(notif.id === id || notif._id === id)));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return false;
    }
  }, []);

  // Supprimer toutes les notifications lues
  const deleteReadNotifications = useCallback(async () => {
    try {
      const result = await notificationService.deleteReadNotifications();
      setNotifications(prev => prev.filter(notif => !notif.read));
      return result;
    } catch (error) {
      console.error('Erreur lors de la suppression des lues:', error);
      return { count: 0 };
    }
  }, []);

  return {
    // État
    notifications,
    unreadCount,
    loading,
    currentPage,
    totalPages,
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications
  };
};

export default useNotifications;
