import React, { useState } from 'react';
import { Bell, Check, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { INotification } from '@/services/api/notificationService';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationCenter() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'unread'>('date');
  
  // Utiliser le hook centralisé pour les notifications
  const {
    notifications,
    unreadCount,
    loading,
    currentPage,
    totalPages,
    fetchNotifications,
    markAsRead,
    markAllAsRead: markAllAsReadFn,
    deleteNotification,
    deleteReadNotifications
  } = useNotifications();

  // Le chargement initial est maintenant géré par le hook useNotifications
  
  // Fonction pour charger plus de notifications lors du défilement
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      console.log(`🔍 Chargement de la page suivante: ${currentPage + 1}`);
      fetchNotifications(currentPage + 1);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      console.log(`🔎 NotificationCenter - Appel de markAsRead pour ${id}`);
      const success = await markAsRead(id);
      
      if (success) {
        toast({
          title: "Succès",
          description: "Notification marquée comme lue",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsReadFn();
      toast({
        title: "Succès",
        description: `${result.count} notifications marquées comme lues`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer toutes les notifications comme lues",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteNotification(id);
      if (success) {
        toast({
          title: "Succès",
          description: "Notification supprimée",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRead = async () => {
    try {
      const result = await deleteReadNotifications();
      toast({
        title: "Succès",
        description: `${result.count} notifications supprimées`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les notifications lues",
        variant: "destructive",
      });
    }
  };



  const getNotificationIcon = (type: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      APPOINTMENT_REMINDER: <Bell className="h-4 w-4 text-blue-500" />,
      APPOINTMENT_CANCELLATION: <Bell className="h-4 w-4 text-red-500" />,
      APPOINTMENT_MODIFICATION: <Bell className="h-4 w-4 text-yellow-500" />,
      NEW_DOCUMENT: <Bell className="h-4 w-4 text-green-500" />,
      NEW_INVOICE: <Bell className="h-4 w-4 text-purple-500" />,
      INVOICE_PAID: <Bell className="h-4 w-4 text-green-500" />,
      INVOICE_OVERDUE: <Bell className="h-4 w-4 text-red-500" />,
    };
    return iconMap[type] || <Bell className="h-4 w-4" />;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return 'Date inconnue';
    }
    
    try {
      // Vérifier si la date est valide
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Date invalide:', dateString);
        return 'Date invalide';
      }
      
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Erreur de date';
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[400px] sm:min-w-[740px] mr-2">
        <SheetHeader className="flex flex-row flex-wrap items-center justify-between">
          <SheetTitle>Notifications</SheetTitle>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchNotifications(1)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
            <div className="flex items-center flex-wrap justify-start gap-1 space-x-2">
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="APPOINTMENT">Rendez-vous</option>
                <option value="DOCUMENT">Documents</option>
                <option value="INVOICE">Factures</option>
                <option value="unread">Non lus</option>
              </select>

              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'unread')}
              >
                <option value="date">Date</option>
                <option value="unread">Non lus en premier</option>
              </select>

              <Button
                size="sm"
                variant="outline"
                onClick={handleDeleteRead}
                disabled={!notifications?.some(n => n.read)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer lues
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="space-y-4">
            {notifications
              ?.filter(notification => {
                if (filter === 'all') return true;
                if (filter === 'unread') return !notification.read;
                return notification.type.startsWith(filter);
              })
              ?.sort((a, b) => {
                if (sortBy === 'unread') {
                  if (a.read === b.read) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  }
                  return a.read ? 1 : -1;
                }
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              ?.map((notification) => (
              <div
                key={notification.id || notification._id}
                className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${
                  notification.read ? 'bg-secondary/20' : 'bg-secondary'
                }`}
              >
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow space-y-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{notification.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  {notification.data && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {Object.entries(notification.data).map(([key, value]) => (
                        value && <div key={key}>{`${key}: ${value}`}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 space-y-2">
                  {!notification.read && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleMarkAsRead(notification.id || notification._id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(notification.id || notification._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {currentPage < totalPages && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Chargement...' : 'Charger plus'}
              </Button>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
