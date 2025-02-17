import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClientService } from "@/services/api/clientService";

const Clients = () => {
  const [search, setSearch] = useState(""); // État pour la recherche
  const [clients, setClients] = useState([]); // État pour la liste des clients
  const [loading, setLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // État d'erreur
  const [currentPage, setCurrentPage] = useState(1); // État pour la pagination
  const [clientsPerPage] = useState(5); // Nombre de clients par page
  const [dialogOpen, setDialogOpen] = useState(false); // État pour gérer l'ouverture du dialog
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await ClientService.getAll();
        setClients(data);
      } catch (err) {
        setError(err.message);
        toast({ title: "Erreur", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Fonction pour ajouter un nouveau client
  const handleNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClient = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
    };
    try {
      await ClientService.create(newClient);
      toast({
        title: "Client ajouté",
        description: "Le nouveau client a été ajouté avec succès.",
      });
      setDialogOpen(false); // Fermer le dialog après ajout
      // Rafraîchir la liste des clients après ajout
      const updatedClients = await ClientService.getAll();
      setClients(updatedClients);
    } catch (err) {
      if (err.message.includes("duplicate key error")) {
        toast({ title: "Erreur", description: "Un client avec cet email existe déjà.", variant: "destructive" });
      } else {
        toast({ title: "Erreur", description: err.message, variant: "destructive" });
      }
    }
  };

  // Filtrer les clients en fonction de la recherche
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);

  // Changer de page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Clients</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau client</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleNewClient} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" name="name" placeholder="Nom du client" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="email@exemple.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" name="phone" placeholder="06 12 34 56 78" required />
                </div>
                <Button type="submit" className="w-full">
                  Ajouter le client
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </Button>
        </div>

        <div className="grid gap-4">
          {currentClients.map((client) => (
            <Card
              key={client?.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/clients/${client._id}`)}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-medium">{client.name}</h3>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
                    <div className="flex items-center text-gray-500">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="text-sm">{client.email}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Phone className="w-4 h-4 mr-2" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          {Array.from({ length: Math.ceil(filteredClients.length / clientsPerPage) }, (_, index) => (
            <Button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`mx-1 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : ''}`}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Clients;