// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useToast } from "@/components/ui/use-toast";
// import { format, formatDistanceToNow } from "date-fns";
// import { fr } from "date-fns/locale";
// import { Bell, Check, Trash2 } from "lucide-react";


// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   type: "info" | "warning" | "success" | "error";
//   createdAt: string;
//   read: boolean;
// }

// const Notifications = () => {
//   const { toast } = useToast();
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       const response = await fetch("/api/notifications");
//       const data = await response.json();
//       setNotifications(data);
//       setLoading(false);
//     } catch (error) {
//       console.error("Erreur lors du chargement des notifications:", error);
//       toast({
//         title: "Erreur",
//         description: "Impossible de charger les notifications",
//         variant: "destructive",
//       });
//       setLoading(false);
//     }
//   };

//   const markAsRead = async (id: string) => {
//     try {
//       await fetch(`/api/notifications/${id}/read`, {
//         method: "PUT",
//       });
//       setNotifications((prev) =>
//         prev.map((notif) =>
//           notif.id === id ? { ...notif, read: true } : notif
//         )
//       );
//     } catch (error) {
//       console.error("Erreur lors du marquage de la notification:", error);
//       toast({
//         title: "Erreur",
//         description: "Impossible de marquer la notification comme lue",
//         variant: "destructive",
//       });
//     }
//   };

//   const deleteNotification = async (id: string) => {
//     try {
//       await fetch(`/api/notifications/${id}`, {
//         method: "DELETE",
//       });
//       setNotifications((prev) =>
//         prev.filter((notif) => notif.id !== id)
//       );
//       toast({
//         title: "Succès",
//         description: "Notification supprimée",
//       });
//     } catch (error) {
//       console.error("Erreur lors de la suppression de la notification:", error);
//       toast({
//         title: "Erreur",
//         description: "Impossible de supprimer la notification",
//         variant: "destructive",
//       });
//     }
//   };

//   const markAllAsRead = async () => {
//     try {
//       await fetch("/api/notifications/read-all", {
//         method: "PUT",
//       });
//       setNotifications((prev) =>
//         prev.map((notif) => ({ ...notif, read: true }))
//       );
//       toast({
//         title: "Succès",
//         description: "Toutes les notifications ont été marquées comme lues",
//       });
//     } catch (error) {
//       console.error("Erreur lors du marquage des notifications:", error);
//       toast({
//         title: "Erreur",
//         description: "Impossible de marquer toutes les notifications comme lues",
//         variant: "destructive",
//       });
//     }
//   };

//   const deleteAllRead = async () => {
//     try {
//       await fetch("/api/notifications/delete-read", {
//         method: "DELETE",
//       });
//       setNotifications((prev) =>
//         prev.filter((notif) => !notif.read)
//       );
//       toast({
//         title: "Succès",
//         description: "Toutes les notifications lues ont été supprimées",
//       });
//     } catch (error) {
//       console.error("Erreur lors de la suppression des notifications:", error);
//       toast({
//         title: "Erreur",
//         description: "Impossible de supprimer les notifications lues",
//         variant: "destructive",
//       });
//     }
//   };

//   const getNotificationBadge = (type: Notification["type"]) => {
//     switch (type) {
//       case "info":
//         return <Badge variant="default">Info</Badge>;
//       case "warning":
//         return <Badge variant="warning">Attention</Badge>;
//       case "success":
//         return <Badge variant="success">Succès</Badge>;
//       case "error":
//         return <Badge variant="destructive">Erreur</Badge>;
//       default:
//         return null;
//     }
//   };

//   if (loading) {
//     return <div>Chargement...</div>;
//   }

//   return (
//     <div className="container mx-auto py-8">
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <Bell className="h-5 w-5" />
//             <CardTitle>Notifications</CardTitle>
//           </div>
//           <div className="flex space-x-2">
//             <Button
//               variant="outline"
//               onClick={markAllAsRead}
//               disabled={notifications.every((n) => n.read)}
//             >
//               Tout marquer comme lu
//             </Button>
//             <Button
//               variant="outline"
//               onClick={deleteAllRead}
//               disabled={!notifications.some((n) => n.read)}
//             >
//               Supprimer les notifications lues
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <ScrollArea className="h-[600px] pr-4">
//             {notifications.length === 0 ? (
//               <div className="flex h-32 items-center justify-center text-muted-foreground">
//                 Aucune notification
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {notifications.map((notification) => (
//                   <div
//                     key={notification.id}
//                     className={`rounded-lg border p-4 transition-colors ${
//                       !notification.read
//                         ? "border-primary bg-primary/5"
//                         : "border-border"
//                     }`}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="space-y-1">
//                         <div className="flex items-center space-x-2">
//                           {getNotificationBadge(notification.type)}
//                           <h4 className="font-semibold">
//                             {notification.title}
//                           </h4>
//                         </div>
//                         <p className="text-sm text-muted-foreground">
//                           {notification.message}
//                         </p>
//                         <p className="text-xs text-muted-foreground">
//                           {formatDistanceToNow(new Date(notification.createdAt), {
//                             addSuffix: true,
//                             locale: fr,
//                           })}
//                         </p>
//                       </div>
//                       <div className="flex space-x-2">
//                         {!notification.read && (
//                           <Button
//                             size="icon"
//                             variant="ghost"
//                             onClick={() => markAsRead(notification.id)}
//                           >
//                             <Check className="h-4 w-4" />
//                           </Button>
//                         )}
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           onClick={() => deleteNotification(notification.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </ScrollArea>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default Notifications;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Trash2, RefreshCw, AlertCircle, CheckCircle2, Clock, FileText, CreditCard, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { INotification } from '@/services/api/notificationService';

/**
 * Page du centre de notifications
 * Interface professionnelle pour gérer toutes les notifications
 */
const NotificationsPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedNotification, setSelectedNotification] = useState<INotification | null>(null);

  // Utilisation du hook centralisé de notifications
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

  // Filtrer les notifications en fonction de l'onglet actif
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    if (activeTab === "appointment") return notification.type.includes("APPOINTMENT");
    if (activeTab === "client") return notification.type.includes("CLIENT");
    if (activeTab === "invoice") return notification.type.includes("INVOICE");
    if (activeTab === "document") return notification.type.includes("DOCUMENT");
    return true;
  });

  // Obtenir le nombre de notifications par catégorie
  const getCount = (category: string): number => {
    if (category === "all") return notifications.length;
    if (category === "unread") return notifications.filter(n => !n.read).length;
    if (category === "appointment") return notifications.filter(n => n.type.includes("APPOINTMENT")).length;
    if (category === "client") return notifications.filter(n => n.type.includes("CLIENT")).length;
    if (category === "invoice") return notifications.filter(n => n.type.includes("INVOICE")).length;
    if (category === "document") return notifications.filter(n => n.type.includes("DOCUMENT")).length;
    return 0;
  };

  // Obtenir l'icône pour le type de notification
  const getNotificationIcon = (type: string) => {
    if (type.includes("APPOINTMENT")) {
      if (type.includes("CANCELLATION")) return <Clock className="h-5 w-5 text-red-500" />;
      if (type.includes("MODIFICATION")) return <Clock className="h-5 w-5 text-yellow-500" />;
      return <Clock className="h-5 w-5 text-blue-500" />;
    }
    
    if (type.includes("CLIENT")) {
      if (type.includes("CREATED")) return <User className="h-5 w-5 text-green-500" />;
      if (type.includes("UPDATED")) return <User className="h-5 w-5 text-yellow-500" />;
      if (type.includes("DELETED")) return <User className="h-5 w-5 text-red-500" />;
      return <User className="h-5 w-5 text-blue-500" />;
    }
    
    if (type.includes("INVOICE")) {
      if (type.includes("PAID")) return <CreditCard className="h-5 w-5 text-green-500" />;
      if (type.includes("OVERDUE")) return <CreditCard className="h-5 w-5 text-red-500" />;
      return <CreditCard className="h-5 w-5 text-purple-500" />;
    }
    
    if (type.includes("DOCUMENT")) {
      return <FileText className="h-5 w-5 text-green-500" />;
    }
    
    return <Bell className="h-5 w-5" />;
  };

  // Formater une date pour l'affichage
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date inconnue';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: fr
      });
    } catch (error) {
      return 'Erreur de date';
    }
  };

  // Formater une date complète pour l'affichage détaillé
  const formatFullDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date inconnue';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      
      return format(date, 'PPPPp', { locale: fr });
    } catch (error) {
      return 'Erreur de date';
    }
  };

  // Actions sur les notifications
  const handleMarkAsRead = async (id: string) => {
    try {
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
        setSelectedNotification(null);
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
      setSelectedNotification(null);
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

  // Charger plus de notifications
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchNotifications(currentPage + 1);
    }
  };

  // Ouvrir le détail d'une notification
  const openNotificationDetail = (notification: INotification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Centre de notifications</h1>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchNotifications(1)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeleteRead}
            disabled={!notifications.some(n => n.read)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer lues
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Gérer vos notifications</CardTitle>
          <CardDescription>
            Vous avez {unreadCount} notification{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''} sur un total de {notifications.length}.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-6">
              <TabsTrigger value="all">
                Toutes ({getCount('all')})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Non lues ({getCount('unread')})
              </TabsTrigger>
              <TabsTrigger value="appointment">
                Rendez-vous ({getCount('appointment')})
              </TabsTrigger>
              <TabsTrigger value="client">
                Clients ({getCount('client')})
              </TabsTrigger>
              <TabsTrigger value="invoice">
                Factures ({getCount('invoice')})
              </TabsTrigger>
              <TabsTrigger value="document">
                Documents ({getCount('document')})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              <ScrollArea className="h-[calc(100vh-300px)]">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <AlertCircle className="h-10 w-10 mb-2" />
                    <p>Aucune notification dans cette catégorie</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map(notification => (
                      <div 
                        key={notification.id || notification._id} 
                        className={`flex items-start p-4 rounded-lg border transition-colors cursor-pointer
                          ${!notification.read 
                            ? 'bg-primary/5 border-primary/30' 
                            : 'bg-card border-muted-foreground/20'}`}
                        onClick={() => openNotificationDetail(notification)}
                      >
                        <div className="flex-shrink-0 mr-4">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-base">{notification.title}</h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {notification.data && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(notification.data).map(([key, value]) => (
                                value && (
                                  <Badge key={key} variant="secondary" className="text-xs">
                                    {key}: {value}
                                  </Badge>
                                )
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0 ml-3 flex flex-col space-y-2">
                          <TooltipProvider>
                            {!notification.read && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id || notification._id || '');
                                    }}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Marquer comme lu</TooltipContent>
                              </Tooltip>
                            )}
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(notification.id || notification._id || '');
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Supprimer</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Modal de détail de notification */}
      {selectedNotification && (
        <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <div className="flex items-center space-x-3">
                {getNotificationIcon(selectedNotification.type)}
                <DialogTitle>{selectedNotification.title}</DialogTitle>
              </div>
              <DialogDescription className="pt-2">
                {selectedNotification.read ? (
                  <Badge variant="outline" className="text-xs mr-2">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Lue
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs mr-2">
                    Nouvelle
                  </Badge>
                )}
                <Badge className="text-xs">
                  {formatFullDate(selectedNotification.createdAt)}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {selectedNotification.message}
              </p>
              
              {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Informations complémentaires:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedNotification.data).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex flex-col">
                          <span className="text-xs text-muted-foreground">{key}</span>
                          <span className="text-sm">{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              {!selectedNotification.read && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsRead(selectedNotification.id || selectedNotification._id || '')}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Marquer comme lu
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(selectedNotification.id || selectedNotification._id || '')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default NotificationsPage;
