import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input'; // Importer le composant Input
import { Label } from '@/components/ui/label'; // Importer le composant Label
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientService } from '@/services/api/clientService';
import { AppointmentService } from '@/services/api/appointmentService';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Mail, Phone, User } from "lucide-react";

const ClientDetails = () => {
  const { id } = useParams(); // Récupérer l'ID du client depuis l'URL
  const [client, setClient] = useState(null); // État pour stocker les détails du client
  const [appointments, setAppointments] = useState([]); // État pour stocker les rendez-vous
  const [notes, setNotes] = useState([]); // État pour stocker les notes
  const [loading, setLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // État d'erreur
  const [dialogOpen, setDialogOpen] = useState(false); // État pour gérer l'ouverture du dialog de modification
  const { toast } = useToast(); // Hook pour afficher des notifications
  const navigate = useNavigate(); // Hook pour naviguer entre les pages

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const data = await ClientService.getById(id); // Récupérer les détails du client
        setClient(data);
        const appointmentsData = await AppointmentService.getById(id); // Récupérer les rendez-vous du client
        setAppointments(appointmentsData);
        const notesData = await ClientService.getNotesById(id); // Récupérer les notes du client
        setNotes(notesData);
      } catch (err) {
        setError(err.message); // Gérer l'erreur
        toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false); // Fin du chargement
      }
    };
    fetchClient(); // Appeler la fonction pour récupérer les détails du client
  }, [id]);

  // Fonction pour mettre à jour le client
  const handleUpdateClient = async (updatedData) => {
    try {
      await ClientService.update(client._id, updatedData); // Appeler le service pour mettre à jour le client
      toast({ title: "Client mis à jour", description: "Les informations du client ont été mises à jour avec succès." });
      // Rafraîchir les détails du client après mise à jour
      const updatedClient = await ClientService.getById(client._id);
      setClient(updatedClient);
      setDialogOpen(false); // Fermer le dialog après mise à jour
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  // Fonction pour supprimer le client
  const handleDeleteClient = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) { // Confirmation avant suppression
      try {
        await ClientService.delete(client._id); // Appeler le service pour supprimer le client
        toast({ title: "Client supprimé", description: "Le client a été supprimé avec succès." });
        navigate('/clients'); // Rediriger vers la liste des clients
      } catch (err) {
        toast({ title: "Erreur", description: err.message, variant: "destructive" });
      }
    }
  };

  if (loading) return <div>Loading...</div>; // Afficher un message de chargement
  // if (error) return <div>Error: {error}</div>; // Afficher un message d'erreur

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Détails du client</h1>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Modifier</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifier le client</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const updatedData = {
                    name: e.target.name.value,
                    email: e.target.email.value,
                    phone: e.target.phone.value,
                  };
                  handleUpdateClient(updatedData); // Appeler la fonction de mise à jour
                }}>
                  <div className="space-y-4">
                    <Label htmlFor="name">Nom</Label>
                    <Input type="text" id="name" name="name" defaultValue={client.name} required />
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" name="email" defaultValue={client.email} required />
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input type="text" id="phone" name="phone" defaultValue={client.phone} required />
                    <Button type="submit">Mettre à jour</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" onClick={handleDeleteClient}>Supprimer</Button>
          </div>
        </div>

        {client ? (
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="font-medium">{client.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Date d'inscription</p>
                    <p className="font-medium">{client.registrationDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="text-center text-gray-500">
            <p>Aucun client trouvé.</p>
          </Card>
        )}

        <Tabs defaultValue="appointments" className="w-full">
          <TabsList>
            <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="appointments">
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center text-gray-500">
                  <p>Aucun rendez-vous trouvé pour ce client.</p>
                </div>
              ) : (
                appointments.map((appointment, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h3 className="font-medium">{appointment.title}</h3>
                        <p>{appointment.date}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="notes">
            <div className="space-y-4">
              {notes.length === 0 ? (
                <div className="text-center text-gray-500">
                  <p>Aucune note trouvée pour ce client.</p>
                </div>
              ) : (
                notes.map((note, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex flex-col">
                      <p>{note.content}</p>
                      <p className="text-sm text-gray-500">{note.date}</p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ClientDetails;