import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"; // Importer les composants de sélection

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { appointmentService } from "@/services/api/appointmentService";
import { clientService } from "@/services/api/clientService";

const Appointments = () => {
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]); // État pour stocker les clients
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false); // État pour gérer l'ouverture du dialog d'ajout de rendez-vous
  const { toast } = useToast(); // Hook pour afficher des notifications


  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.getAll();
        setAppointments(data);
      } catch (err) {
        setError(err.message);
        toast({ title: "Erreur", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    const fetchClients = async () => {
      try {
        const clientData = await clientService.getAll(); // Récupérer tous les clients
        setClients(clientData);
      } catch (err) {
        setError(err.message);
        toast({ title: "Erreur", description: err.message, variant: "destructive" });
      }
    };

    fetchAppointments();
    fetchClients(); // Appeler la fonction pour récupérer les clients
  }, []);

  // Fonction pour ajouter un rendez-vous
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const appointmentData = {
      clientId: e.target.client.value,
      title: e.target.title.value,
      date: e.target.date.value,
      time: e.target.time.value,
      notes: e.target.notes.value,
    };
    try {
      const newAppointment = await appointmentService.create(appointmentData); // Appeler le service pour créer un nouveau rendez-vous
      setAppointments([...appointments, newAppointment]); // Ajouter le nouveau rendez-vous à l'état local
      toast({ title: "Rendez-vous ajouté", description: "Le rendez-vous a été ajouté avec succès." });
      setDialogOpen(false); // Fermer le dialog après ajout
    } catch (err) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  // Fonction pour filtrer les rendez-vous
  const handleFilter = () => {
    // Implémentez ici la logique de filtrage selon vos besoins
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;



  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Rendez-vous</h1>
        {/* Dialog pour ajouter un rendez-vous */}
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
                <Input id="title" name="title" placeholder="Title du rendez-vous" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select id="client" name="client" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {clients.map(client => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Heure</Label>
                  <Input id="time" name="time" type="time" />
                </div>
              </div>
              {/* <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select id="type" name="type" required >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Rendez-vous">Rendez-vous</SelectItem>
                      <SelectItem value="Suivi">Suivi</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" placeholder="Notes additionnelles..." />
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
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" onClick={handleFilter} />
          Filtrer
        </Button>
      </div>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="p-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h3 className="font-medium">{appointment.title}</h3>
                <p className="text-sm text-gray-500">{appointment.client}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{appointment.time}</p>
                  <p className="text-sm text-gray-500">{appointment.date}</p>
                </div>
                <Button variant="outline" size="sm">
                  Modifier
                </Button>
                <Button variant="destructive" size="sm">
                  Supprimer
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Appointments;