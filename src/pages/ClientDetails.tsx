import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { clientService } from '@/services/api/clientService';
import { appointmentService } from '@/services/api/appointmentService';
import { noteService } from '@/services/api/noteService';
import { IClient } from '@/types/client';
import { IAppointment, AppointmentType } from '@/types/appointment';
import { INote } from '@/types/note';
import { Loader2, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { NoteForm } from '@/components/forms/note/NoteForm';
import { useAuth } from '@/hooks/useAuth';

const appointmentTypes: { value: AppointmentType; label: string }[] = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow-up', label: 'Suivi' },
  { value: 'emergency', label: 'Urgence' },
  { value: 'other', label: 'Autre' }
];

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<IClient | null>(null);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [notes, setNotes] = useState<INote[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Partial<IAppointment>>({
    title: '',
    description: '',
    date: '',
    duration: 30,
    type: 'consultation',
    notes: '',
    location: ''
  });
  const {user} = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        const [clientData, appointmentsData, notesData] = await Promise.all([
          clientService.getById(id),
          appointmentService.getByClientId(id),
          noteService.getNotesByClientId(id)
        ]);

        setClient(clientData);
        setAppointments(appointmentsData || []);
        setNotes(notesData || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Erreur lors de la récupération des données du client"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Client non trouvé</p>
      </div>
    );
  }

  const handleUpdateNotes = async (data: { content: string }) => {
    try {
      if (!client) return;
      await noteService.createNote({
        content: data.content,
        clientId: client._id
      });
      await loadNotes();
      toast({
        title: "Succès",
        description: "Note ajoutée avec succès"
      });
      setShowNoteForm(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Erreur lors de l'ajout de la note"
      });
    }
  };

  const loadNotes = async () => {
    try {
      if (!id) return;
      const notesData = await noteService.getNotesByClientId(id);
      setNotes(notesData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Erreur lors de la récupération des notes"
      });
    }
  };

  const handleAddAppointment = async () => {
    try {
      if (!client?._id) {
        throw new Error('ID du client manquant');
      }

      const appointmentData = {
        ...newAppointment,
        clientId: client._id,
        practitionerId: user?.id,
        date: new Date(newAppointment.date).toISOString(),
        duration: Number(newAppointment.duration)
      };

      const newAppointmentData = await appointmentService.create(appointmentData);
      setAppointments(prev => [...prev, newAppointmentData]);
      
      toast({
        title: "Succès",
        description: "Le rendez-vous a été créé avec succès"
      });
      
      setDialogOpen(false);
      setNewAppointment({
        title: '',
        description: '',
        date: '',
        duration: 30,
        type: 'consultation',
        notes: '',
        location: ''
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le rendez-vous"
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {client.firstName} {client.lastName}
        </h1>
        <div className="space-x-2">
          <Button onClick={() => setShowNoteForm(true)} variant="outline">
            Ajouter une note
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            Nouveau rendez-vous
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations de contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{client?.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{client.phone}</span>
            </div>
            {client?.address && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{client.address}</span>
              </div>
            )}
            {client?.birthDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>
                  {format(parseISO(client.birthDate), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {notes.length > 0 ? (
              <div className="space-y-4">
                {notes?.map((note) => (
                  <div key={note._id} className="p-4 bg-gray-50 rounded-lg">
                    <p className="whitespace-pre-wrap">{note.content}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {format(parseISO(note.date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucune note</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rendez-vous</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments?.length > 0 ? (
            <div className="space-y-4">
              {appointments?.map((appointment) => (
                <div
                  key={appointment?.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold">{appointment.title}</h3>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(appointment.date), 'dd MMMM yyyy HH:mm', {
                        locale: fr,
                      })}
                      {' - '}
                      {appointment.duration} minutes
                    </p>
                    {appointment.location && (
                      <p className="text-sm text-gray-500">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {appointment.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'pending'
                          ? 'bg-blue-100 text-blue-800'
                          : appointment.status === 'confirmed'
                          ? 'bg-yellow-100 text-yellow-800'
                          : appointment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucun rendez-vous</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau rendez-vous</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={newAppointment.title}
                onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newAppointment.description}
                onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="date">Date et heure</Label>
              <Input
                id="date"
                type="datetime-local"
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Durée (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={newAppointment.duration}
                onChange={(e) => setNewAppointment({ ...newAppointment, duration: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={newAppointment.type}
                onValueChange={(value: AppointmentType) => setNewAppointment({ ...newAppointment, type: value })}
              >
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
            <div>
              <Label htmlFor="location">Lieu</Label>
              <Input
                id="location"
                value={newAppointment.location}
                onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddAppointment}>
              Créer le rendez-vous
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showNoteForm && (
        <NoteForm
          onSubmit={handleUpdateNotes}
          onCancel={() => setShowNoteForm(false)}
        />
      )}
    </div>
  );
};