import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { clientService } from '@/services/api/clientService';
import { appointmentService } from '@/services/api/appointmentService';
import { IClient } from '@/types/client';
import { IAppointment } from '@/types/appointment';
import { toast } from 'sonner';
import { Loader2, Calendar, Mail, Phone, MapPin, FileText } from 'lucide-react';
import AppointmentForm from '@/components/forms/appointment/AppointmentForm';
import {NoteForm} from '@/components/forms/note/NoteForm.tsx';

const ClientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<IClient | null>(null);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        const [clientData, appointmentsData] = await Promise.all([
          clientService.getById(id),
          appointmentService.getByClientId(id)
        ]);

        setClient(clientData);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        toast.error('Erreur lors de la récupération des données du client');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdateNotes = async (notes: string) => {
    try {
      if (!client || !id) return;

      const updatedClient = await clientService.update(id, { notes });
      setClient(updatedClient);
      setShowNoteForm(false);
      toast.success('Notes mises à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notes:', error);
      toast.error('Erreur lors de la mise à jour des notes');
    }
  };

  const handleAddAppointment = async (appointmentData: Partial<IAppointment>) => {
    try {
      if (!client) return;

      const newAppointment = await appointmentService.create({
        ...appointmentData,
        clientId: client._id
      });

      setAppointments(prev => [...prev, newAppointment]);
      setShowAppointmentForm(false);
      toast.success('Rendez-vous ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du rendez-vous:', error);
      toast.error('Erreur lors de l\'ajout du rendez-vous');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg text-gray-600">Client non trouvé</p>
        <Button onClick={() => navigate('/clients')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

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
          <Button onClick={() => setShowAppointmentForm(true)}>
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
              <span>{client.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{client.phone}</span>
            </div>
            {client.address && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{client.address}</span>
              </div>
            )}
            {client.birthDate && (
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
            {client.notes ? (
              <div className="whitespace-pre-wrap">{client.notes}</div>
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
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{appointment.title}</h3>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(appointment.startDate), 'dd MMMM yyyy HH:mm', {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-800'
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

      {showNoteForm && (
        <NoteForm
          initialNotes={client.notes}
          onSubmit={handleUpdateNotes}
          onCancel={() => setShowNoteForm(false)}
        />
      )}

      {showAppointmentForm && (
        <AppointmentForm
          onSubmit={handleAddAppointment}
          onCancel={() => setShowAppointmentForm(false)}
        />
      )}
    </div>
  );
};

export default ClientDetails;