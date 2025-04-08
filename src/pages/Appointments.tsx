// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem
// } from "@/components/ui/select"; // Importer les composants de sélection

// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Plus, Search, Filter } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { appointmentService } from "@/services/api/appointmentService";
// import { clientService } from "@/services/api/clientService";

// const Appointments = () => {
//   const [search, setSearch] = useState("");
//   const [appointments, setAppointments] = useState([]);
//   const [clients, setClients] = useState([]); // État pour stocker les clients
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [dialogOpen, setDialogOpen] = useState(false); // État pour gérer l'ouverture du dialog d'ajout de rendez-vous
//   const { toast } = useToast(); // Hook pour afficher des notifications


//   useEffect(() => {
//     const fetchAppointments = async () => {
//       try {
//         const data = await appointmentService.getAll();
//         setAppointments(data);
//       } catch (err) {
//         setError(err.message);
//         toast({ title: "Erreur", description: err.message, variant: "destructive" });
//       } finally {
//         setLoading(false);
//       }
//     };

//     const fetchClients = async () => {
//       try {
//         const clientData = await clientService.getAll(); // Récupérer tous les clients
//         setClients(clientData);
//       } catch (err) {
//         setError(err.message);
//         toast({ title: "Erreur", description: err.message, variant: "destructive" });
//       }
//     };

//     fetchAppointments();
//     fetchClients(); // Appeler la fonction pour récupérer les clients
//   }, []);

//   // Fonction pour ajouter un rendez-vous
//   const handleAddAppointment = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const appointmentData = {
//       clientId: e.target.client.value,
//       title: e.target.title.value,
//       date: e.target.date.value,
//       time: e.target.time.value,
//       notes: e.target.notes.value,
//     };
//     try {
//       const newAppointment = await appointmentService.create(appointmentData); // Appeler le service pour créer un nouveau rendez-vous
//       setAppointments([...appointments, newAppointment]); // Ajouter le nouveau rendez-vous à l'état local
//       toast({ title: "Rendez-vous ajouté", description: "Le rendez-vous a été ajouté avec succès." });
//       setDialogOpen(false); // Fermer le dialog après ajout
//     } catch (err) {
//       toast({ title: "Erreur", description: err.message, variant: "destructive" });
//     }
//   };

//   // Fonction pour filtrer les rendez-vous
//   const handleFilter = () => {
//     // Implémentez ici la logique de filtrage selon vos besoins
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;



//   return (
//     <div className="space-y-8">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <h1 className="text-3xl font-bold">Rendez-vous</h1>
//         {/* Dialog pour ajouter un rendez-vous */}
//         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="w-4 h-4 mr-2" />
//               Nouveau rendez-vous
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Nouveau rendez-vous</DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleAddAppointment} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="title">Titre</Label>
//                 <Input id="title" name="title" placeholder="Title du rendez-vous" />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="client">Client</Label>
//                 <Select id="client" name="client" required>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Sélectionnez un client" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white">
//                     {clients.map(client => (
//                       <SelectItem key={client._id} value={client._id}>
//                         {client.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="date">Date</Label>
//                   <Input id="date" name="date" type="date" />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="time">Heure</Label>
//                   <Input id="time" name="time" type="time" />
//                 </div>
//               </div>
//               {/* <div className="space-y-2">
//                   <Label htmlFor="type">Type</Label>
//                   <Select id="type" name="type" required >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Sélectionnez un type" />
//                     </SelectTrigger>
//                     <SelectContent className="bg-white">
//                       <SelectItem value="Rendez-vous">Rendez-vous</SelectItem>
//                       <SelectItem value="Suivi">Suivi</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div> */}
//               <div className="space-y-2">
//                 <Label htmlFor="notes">Notes</Label>
//                 <Input id="notes" name="notes" placeholder="Notes additionnelles..." />
//               </div>
//               <Button type="submit" className="w-full">
//                 Créer le rendez-vous
//               </Button>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Barre de recherche */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
//           <Input
//             placeholder="Rechercher un rendez-vous..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//         <Button variant="outline">
//           <Filter className="w-4 h-4 mr-2" onClick={handleFilter} />
//           Filtrer
//         </Button>
//       </div>

//       <div className="grid gap-4">
//         {appointments.map((appointment) => (
//           <Card key={appointment.id} className="p-6">
//             <div className="flex flex-col sm:flex-row justify-between gap-4">
//               <div>
//                 <h3 className="font-medium">{appointment.title}</h3>
//                 <p className="text-sm text-gray-500">{appointment.client}</p>
//               </div>
//               <div className="flex items-center gap-4">
//                 <div className="text-right">
//                   <p className="text-sm font-medium">{appointment.time}</p>
//                   <p className="text-sm text-gray-500">{appointment.date}</p>
//                 </div>
//                 <Button variant="outline" size="sm">
//                   Modifier
//                 </Button>
//                 <Button variant="destructive" size="sm">
//                   Supprimer
//                 </Button>
//               </div>
//             </div>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Appointments;

// frontend/src/pages/Appointments.tsx
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  Filter,
  Plus,
  Search,
  Clock,
  User,
  Type as TypeIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { appointmentService } from '@/services/api/appointmentService';
import { clientService } from '@/services/api/clientService';
import { IAppointment, AppointmentStatus, AppointmentType } from '@/types/appointment';
import { IClient } from '@/types/client';
import { toast } from '@/components/ui/use-toast';
import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

const appointmentTypes: { value: AppointmentType; label: string }[] = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow-up', label: 'Suivi' },
  { value: 'emergency', label: 'Urgence' },
  { value: 'other', label: 'Autre' }
];

const appointmentStatuses: { value: AppointmentStatus; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'scheduled', label: 'Planifié' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' }
];

export const Appointments = () => {
  // États
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | ''>('');
  const [selectedType, setSelectedType] = useState<AppointmentType | ''>('');

  // Formulaire nouveau rendez-vous
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    clientId: '',
    date: '',
    // time: '',
    duration: 30,
    type: 'consultation' as AppointmentType,
    notes: '',
  });

  // Effets
  useEffect(() => {
    fetchData();
  }, [currentPage, selectedStatus, selectedType]);

  // Fonctions
  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, clientsData] = await Promise.all([
        appointmentService.getAll(),
        clientService.getAll()
      ]);
      setAppointments(appointmentsData);
      setClients(clientsData);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateTime = new Date(`${newAppointment.date}T${newAppointment.time}`);

      await appointmentService.create({
        ...newAppointment,
        date: dateTime,
      });

      toast({
        title: "Succès",
        description: "Le rendez-vous a été créé avec succès",
      });

      setDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleFilter = () => {
    // Cette fonction peut être appelée lorsque l'utilisateur clique sur le bouton de filtrage
    // Elle met à jour l'état des rendez-vous filtrés en fonction des critères sélectionnés

    const filteredAppointments = appointments
      .filter(appointment => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          appointment.title.toLowerCase().includes(searchLower) ||
          clients.find(c => c._id === appointment.clientId)?.firstName.toLowerCase().includes(searchLower) ||
          clients.find(c => c._id === appointment.clientId)?.lastName.toLowerCase().includes(searchLower);

        const matchesStatus = !selectedStatus || appointment.status === selectedStatus;
        const matchesType = !selectedType || appointment.type === selectedType;

        return matchesSearch && matchesStatus && matchesType;
      });

    setAppointments(filteredAppointments); // Mettre à jour l'état avec les rendez-vous filtrés
    setCurrentPage(1); // Réinitialiser la page actuelle à 1 après le filtrage
  };

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await appointmentService.updateStatus(appointmentId, newStatus);
      fetchData();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (appointmentId: string) => {
    const appointmentToEdit = appointments.find(a => a._id === appointmentId);
    if (appointmentToEdit) {
      setNewAppointment({
        title: appointmentToEdit.title,
        clientId: appointmentToEdit.clientId,
        date: format(new Date(appointmentToEdit.date), 'yyyy-MM-dd'), // Format pour le champ date
        // time: appointmentToEdit.time,
        duration: appointmentToEdit.duration,
        type: appointmentToEdit.type,
        notes: appointmentToEdit.notes,
      });
      setDialogOpen(true); // Ouvrir le dialogue pour modifier le rendez-vous
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        await appointmentService.delete(appointmentId);
        fetchData(); // Recharger les données après la suppression
        toast({
          title: "Succès",
          description: "Le rendez-vous a été supprimé avec succès.",
        });
      } catch (err: any) {
        toast({
          title: "Erreur",
          description: err.message,
          variant: "destructive",
        });
      }
    }
  };
  // Filtrage et pagination
  const filteredAppointments = appointments
    .filter(appointment => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        appointment.title.toLowerCase().includes(searchLower) ||
        clients.find(c => c._id === appointment.clientId)?.firstName.toLowerCase().includes(searchLower);

      const matchesStatus = !selectedStatus || appointment.status === selectedStatus;
      const matchesType = !selectedType || appointment.type === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });

  const paginatedAppointments = filteredAppointments
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Rendez-vous</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau rendez-vous
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau rendez-vous</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" name="title" placeholder="Titre du rendez-vous" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select id="client" name="client" required onChange={(e) => setNewAppointment({ ...newAppointment, clientId: e.target.value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {clients.map(client => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.firstName} {client.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" required onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Heure</Label>
                  <Input id="time" name="time" type="time" required onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" placeholder="Notes additionnelles..." onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">
                Créer le rendez-vous
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barre de recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Rechercher un rendez-vous..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleFilter}>
          <Filter className="w-4 h-4 mr-2" />
          Filtrer
        </Button>
      </div>

      {/* Liste des rendez-vous */}
      <div className="grid gap-4">
        {paginatedAppointments.length > 0 ? paginatedAppointments.map((appointment) => (
          <Card key={appointment._id} className="p-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h3 className="font-medium">{appointment.title}</h3>
                <p className="text-sm text-gray-500">
                  Client: {clients.find(c => c._id === appointment.clientId)?.firstName} {clients.find(c => c._id === appointment.clientId)?.lastName}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select
                  value={appointment.status}
                  onValueChange={(newStatus) => handleStatusChange(appointment._id, newStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={appointment.status} />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-right">
                  <p className="text-sm font-medium">{format(new Date(appointment.date), 'dd/MM/yyyy')}</p>
                  {/* <p className="text-sm text-gray-500">{appointment.time}</p> */}
                </div>
                <Button variant="outline" size="sm" onClick={() => handleEdit(appointment._id)}>
                  Modifier
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(appointment._id)}>
                  Supprimer
                </Button>
              </div>
            </div>
          </Card>
        ))
          :
          <Card className="text-center py-4 text-gray-500">
            <p>Aucun rendez-vous trouvé.</p>
          </Card>
        }
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredAppointments.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Appointments;