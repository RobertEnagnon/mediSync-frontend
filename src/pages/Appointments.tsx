import { useState, useEffect } from 'react';
import { format, parseISO, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  Filter,
  Plus,
  Search,
  Clock,
  User,
  MapPin,
  Type as TypeIcon,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Button
} from '@/components/ui/button';
import {
  Input
} from '@/components/ui/input';
import {
  Label
} from '@/components/ui/label';
import {
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from '@/components/ui/card';
import {
  Textarea
} from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import 
  appointmentService
 from '@/services/api/appointmentService';
import {
  clientService
} from '@/services/api/clientService';
import {
  IClient
} from '@/types/client';
import {
  IAppointment, 
  AppointmentType, 
  AppointmentStatus
} from '@/types/appointment';
import {
  toast
} from '@/components/ui/use-toast';
import {
  Pagination
} from '@/components/ui/pagination';
import {
  useAuth
} from '@/hooks/useAuth';
import {
  Badge
} from '@/components/ui/badge';
import {
  Loader2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import cn from 'classnames';

const ITEMS_PER_PAGE = 10;
const DEFAULT_DURATION = 30;

const appointmentTypes: { value: AppointmentType; label: string }[] = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow-up', label: 'Suivi' },
  { value: 'emergency', label: 'Urgence' },
  { value: 'other', label: 'Autre' }
];

const appointmentStatuses = [
  { value: 'scheduled' as AppointmentStatus, label: 'Planifié' },
  { value: 'completed' as AppointmentStatus, label: 'Terminé' },
  { value: 'cancelled' as AppointmentStatus, label: 'Annulé' },
  { value: 'pending' as AppointmentStatus, label: 'En attente' }
];

export default function Appointments() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedType, setSelectedType] = useState<AppointmentType>('consultation');
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, clientsData] = await Promise.all([
        appointmentService.getAll(),
        clientService.getAll()
      ]);
      setAppointments(appointmentsData || []);
      setClients(clientsData || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de charger les données"
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
      if (!selectedClient || !user?.id) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Veuillez sélectionner un client"
        });
        return;
      }

      const date = formData.get('date') as string;
      if (!date) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "La date est requise"
        });
        return;
      }

      const appointmentData = {
        title: (formData.get('title') as string) || 'Rendez-vous',
        description: formData.get('description') as string,
        date: new Date(date).toISOString(),
        duration,
        clientId: selectedClient,
        practitionerId: user.id,
        type: selectedType,
        notes: formData.get('notes') as string,
        location: formData.get('location') as string,
        status: 'pending' as AppointmentStatus
      };
      console.log(appointmentData);
      const newAppointment = await appointmentService.create(appointmentData);
      setAppointments(prev => [...prev, newAppointment]);
      
      toast({
        title: "Succès",
        description: "Le rendez-vous a été créé"
      });
      
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer le rendez-vous"
      });
    }
  };

  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      if (!selectedClient || !user?.id) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Veuillez sélectionner un client"
        });
        return;
      }

      const date = formData.get('date') as string;
      if (!date) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "La date est requise"
        });
        return;
      }

      const appointmentData = {
        title: (formData.get('title') as string) || 'Rendez-vous',
        description: formData.get('description') as string,
        date: new Date(date).toISOString(),
        duration,
        clientId: selectedClient,
        practitionerId: user.id,
        type: selectedType,
        notes: formData.get('notes') as string,
        location: formData.get('location') as string,
        status: selectedAppointment.status
      };

      const updatedAppointment = await appointmentService.update(selectedAppointment.id, appointmentData);
      setAppointments(prev => prev.map(app => app.id === selectedAppointment.id ? updatedAppointment : app));
      
      toast({
        title: "Succès",
        description: "Le rendez-vous a été modifié"
      });
      
      setEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de modifier le rendez-vous"
      });
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await appointmentService.delete(selectedAppointment.id);
      setAppointments(prev => prev.filter(app => app.id !== selectedAppointment.id));
      
      toast({
        title: "Succès",
        description: "Le rendez-vous a été supprimé"
      });
      
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de supprimer le rendez-vous"
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    try {
      await appointmentService.updateStatus(id, newStatus);
      
      // Mise à jour locale
      setAppointments(prev => prev.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));

      toast({
        title: "Succès",
        description: "Le statut du rendez-vous a été mis à jour"
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du rendez-vous"
      });
    }
  };

  const resetForm = () => {
    setSelectedClient('');
    setSelectedType('consultation');
    setDuration(DEFAULT_DURATION);
  };

  const openEditDialog = (appointment: IAppointment) => {
    setSelectedAppointment(appointment);
    setSelectedClient(appointment.clientId._id);
    setSelectedType(appointment.type);
    setDuration(appointment.duration);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (appointment: IAppointment) => {
    setSelectedAppointment(appointment);
    setDeleteDialogOpen(true);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const client = clients.find(c => c._id === appointment.clientId);
    const searchLower = search.toLowerCase();
    
    return (
      appointment.title.toLowerCase().includes(searchLower) ||
      appointment.description?.toLowerCase().includes(searchLower) ||
      client?.firstName.toLowerCase().includes(searchLower) ||
      client?.lastName.toLowerCase().includes(searchLower) ||
      appointment.type.toLowerCase().includes(searchLower)
    );
  });

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Rendez-vous</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau rendez-vous
        </Button>
      </div>

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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau rendez-vous</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAppointment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
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

              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" name="title" placeholder="Titre du rendez-vous" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date et heure</Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Durée (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={selectedType} onValueChange={(value: AppointmentType) => setSelectedType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
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

              <div className="space-y-2">
                <Label htmlFor="location">Lieu</Label>
                <Input id="location" name="location" placeholder="Lieu du rendez-vous" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Description du rendez-vous" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Notes sur le rendez-vous" />
            </div>

            <div className="flex justify-end gap-4 sticky bottom-0 bg-white p-4 border-t">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Créer le rendez-vous
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le rendez-vous</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditAppointment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
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

              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="Titre du rendez-vous" 
                  defaultValue={selectedAppointment?.title}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date et heure</Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  defaultValue={selectedAppointment ? format(parseISO(selectedAppointment.startTime), "yyyy-MM-dd'T'HH:mm") : undefined}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Durée (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={selectedType} onValueChange={(value: AppointmentType) => setSelectedType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
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

              <div className="space-y-2">
                <Label htmlFor="location">Lieu</Label>
                <Input 
                  id="location" 
                  name="location" 
                  placeholder="Lieu du rendez-vous"
                  defaultValue={selectedAppointment?.location}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Description du rendez-vous"
                defaultValue={selectedAppointment?.description}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder="Notes sur le rendez-vous"
                defaultValue={selectedAppointment?.notes}
              />
            </div>

            <div className="flex justify-end gap-4 sticky bottom-0 bg-white p-4 border-t">
              <Button variant="outline" type="button" onClick={() => setEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Modifier le rendez-vous
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le rendez-vous</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteAppointment}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {paginatedAppointments?.length > 0 ? (
          paginatedAppointments?.map((appointment) => {
            const status = appointmentStatuses.find(s => s.value === appointment.status);
            const type = appointmentTypes.find(t => t.value === appointment.type);
            const client = clients.find(c => c._id === (typeof appointment.clientId === 'string' ? appointment.clientId : appointment.clientId._id));
            
            return (
              <Card key={appointment.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{appointment.title}</h3>
                        <Badge className={cn(
                          appointment.status === 'scheduled' && "bg-blue-500 hover:bg-blue-600",
                          appointment.status === 'completed' && "bg-green-500 hover:bg-green-600",
                          appointment.status === 'cancelled' && "bg-red-500 hover:bg-red-600",
                          appointment.status === 'pending' && "bg-yellow-500 hover:bg-yellow-600",
                          !appointment.status && "bg-gray-500 hover:bg-gray-600"
                        )}>
                          {status?.label || 'Non défini'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-500">
                        <User className="h-4 w-4" />
                        <span>
                          {client ? `${client.firstName} ${client.lastName}` : 'Client inconnu'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(parseISO(appointment.startTime), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.duration} minutes</span>
                      </div>

                      {appointment.location && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span>{appointment.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-500">
                        <TypeIcon className="h-4 w-4" />
                        <span>{type?.label}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(appointment)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <Clock className="mr-2 h-4 w-4" />
                              Changer le statut
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {appointmentStatuses.map((s) => (
                                <DropdownMenuItem
                                  key={s.value}
                                  onClick={() => handleStatusChange(appointment.id, s.value)}
                                  disabled={appointment.status === s.value}
                                >
                                  <span className={`mr-2 h-2 w-2 rounded-full ${s.value === 'scheduled' ? 'bg-blue-500' : s.value === 'completed' ? 'bg-green-500' : s.value === 'cancelled' ? 'bg-red-500' : s.value === 'pending' ? 'bg-yellow-500' : ''}`}></span>
                                  {s.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(appointment)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="p-6">
            <CardContent className="text-center text-gray-500">
              {search ? 'Aucun rendez-vous ne correspond à votre recherche' : 'Aucun rendez-vous'}
            </CardContent>
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
}