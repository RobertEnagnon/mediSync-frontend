import { useState, useEffect } from 'react';
import { format, addMinutes } from 'date-fns';
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
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { appointmentService } from '@/services/api/appointmentService';
import { clientService } from '@/services/api/clientService';
import { IClient } from '@/types/client';
import { IAppointment, AppointmentType, AppointmentStatus } from '@/types/appointment';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { useAuth } from '@/hooks/useAuth';

const ITEMS_PER_PAGE = 10;
const DEFAULT_DURATION = 30;

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

const Appointments = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedType, setSelectedType] = useState<AppointmentType>('consultation');
  const [duration, setDuration] = useState(DEFAULT_DURATION);
    const { user } = useAuth();

  // Fonction pour charger les données
  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, clientsData] = await Promise.all([
        appointmentService.getAll(),
        clientService.getAll()
      ]);
      setAppointments(appointmentsData);
      setClients(clientsData);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      toast('Erreur lors du chargement des données', {
        description: error.message,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      // Vérification des champs requis
      const clientId = selectedClient;
      const date = formData.get('date') as string;

      if (!date || !clientId) {
        toast('Champs requis manquants', {
          description: 'La date et le client sont requis',
          duration: 3000,
        });
        return;
      }

      // Création du rendez-vous
      const newAppointment = await appointmentService.create({
        title: (formData.get('title') as string) || 'Rendez-vous',
        description: formData.get('description') as string,
        date: new Date(date).toISOString(),
        duration,
        clientId,
        practitionerId: user?.id, // TODO: Utiliser l'ID du praticien connecté
        type: selectedType,
        notes: formData.get('notes') as string,
        location: formData.get('location') as string
      });

      setAppointments(prev => [...prev, newAppointment]);
      setDialogOpen(false);
      toast('Rendez-vous créé', {
        description: 'Le rendez-vous a été ajouté avec succès',
        duration: 3000,
      });

      // Reset form
      setSelectedClient('');
      setSelectedType('consultation');
      setDuration(DEFAULT_DURATION);
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du rendez-vous:', error);
      toast('Erreur', {
        description: error.message || 'Erreur lors de l\'ajout du rendez-vous',
        duration: 3000,
      });
    }
  };

  // Filtrer les rendez-vous
  const filteredAppointments = appointments.filter(appointment => {
    const matchSearch = appointment.title.toLowerCase().includes(search.toLowerCase()) ||
      clients.find(c => c._id === appointment.clientId)?.firstName.toLowerCase().includes(search.toLowerCase()) ||
      clients.find(c => c._id === appointment.clientId)?.lastName.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  // Pagination
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

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
              <DialogTitle>Ajouter un rendez-vous</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" name="title" placeholder="Titre du rendez-vous" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Description du rendez-vous" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientId">Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.firstName} {client.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date et heure</Label>
                  <Input id="date" name="date" type="datetime-local" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Durée (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Notes sur le rendez-vous" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lieu</Label>
                <Input id="location" name="location" placeholder="Lieu du rendez-vous" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={selectedType} onValueChange={(value: AppointmentType) => setSelectedType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
      </div>

      {/* Liste des rendez-vous */}
      <div className="grid gap-4">
        {paginatedAppointments.length > 0 ? (
          paginatedAppointments.map((appointment) => (
            <Card key={appointment._id} className="p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-medium">{appointment.title}</h3>
                  <p className="text-sm text-gray-500">
                    Client: {clients.find(c => c._id === appointment.clientId)?.firstName} {clients.find(c => c._id === appointment.clientId)?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(appointment.date), 'dd/MM/yyyy HH:mm')} - {format(addMinutes(new Date(appointment.date), appointment.duration), 'HH:mm')}
                  </p>
                  {appointment.location && (
                    <p className="text-sm text-gray-500">
                      Lieu: {appointment.location}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Type: {appointmentTypes.find(t => t.value === appointment.type)?.label}
                  </p>
                  <p className="text-sm text-gray-500">
                    Statut: {appointmentStatuses.find(s => s.value === appointment.status)?.label}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                  <Button variant="destructive" size="sm">
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-center text-gray-500">
            <p>Aucun rendez-vous trouvé</p>
          </Card>
        )}
      </div>

      {filteredAppointments.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredAppointments.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default Appointments;