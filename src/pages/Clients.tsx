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
import { Plus, Search, Filter, Mail, Phone, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clientService } from "@/services/api/clientService";
import { IClient } from "@/types/client";
import { ClientForm } from "@/components/forms/client/ClientForm";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Page de gestion des clients
 */
const Clients = () => {
  // États
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<IClient[]>([]);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Chargement initial des clients
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allClients, birthdays] = await Promise.all([
          clientService.getAll(),
          clientService.getUpcomingBirthdays(7)
        ]);
        setClients(allClients);
        setUpcomingBirthdays(birthdays);
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
    fetchData();
  }, []);

  // Gestion de la création d'un nouveau client
  const handleNewClient = async (data: any) => {
    try {
      await clientService.create(data);
      toast({
        title: "Client ajouté",
        description: "Le nouveau client a été ajouté avec succès.",
      });
      setDialogOpen(false);
      
      // Rafraîchir la liste des clients
      const updatedClients = await clientService.getAll();
      setClients(updatedClients);
    } catch (err: any) {
      if (err.message.includes("duplicate key error")) {
        toast({ 
          title: "Erreur", 
          description: "Un client avec cet email existe déjà.", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Erreur", 
          description: err.message, 
          variant: "destructive" 
        });
      }
    }
  };

  // Filtrer les clients en fonction de la recherche
  const filteredClients = clients.filter(client =>
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase()) ||
    client.phone.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <Layout>
      <div className="space-y-8">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Clients</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouveau client</DialogTitle>
              </DialogHeader>
              <ClientForm onSubmit={handleNewClient} onCancel={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Barre de recherche et filtres */}
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

        {/* Liste des anniversaires à venir */}
        {upcomingBirthdays.length > 0 && (
          <Card className="p-4 bg-blue-50">
            <h3 className="font-medium mb-2">🎂 Anniversaires à venir</h3>
            <div className="flex flex-wrap gap-2">
              {upcomingBirthdays.map((client) => (
                <span key={client._id} className="text-sm bg-white px-2 py-1 rounded">
                  {client.firstName} {client.lastName} - {format(new Date(client.birthDate!), 'dd MMMM', { locale: fr })}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Liste des clients */}
        <div className="grid gap-4">
          {currentClients.map((client) => (
            <Card
              key={client._id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/clients/${client._id}`)}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-medium">{client.firstName} {client.lastName}</h3>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
                    <div className="flex items-center text-gray-500">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="text-sm">{client.email}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Phone className="w-4 h-4 mr-2" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                    {client.birthDate && (
                      <div className="flex items-center text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm">
                          {format(new Date(client.birthDate), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{client.address}</span>
                      </div>
                    )}
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
              variant={currentPage === index + 1 ? 'default' : 'outline'}
              className="mx-1"
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