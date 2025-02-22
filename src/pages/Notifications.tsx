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

import React from 'react';
import { NotificationCenter } from '../components/Notifications/NotificationCenter';

/**
 * Page des notifications
 * Affiche le centre de notifications avec toutes les fonctionnalités
 */
const NotificationsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Centre de notifications</h1>
      <NotificationCenter />
    </div>
  );
};

export default NotificationsPage;
