import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Archive,
  Clock,
  Users,
  ChevronDown,
  Cake,
  CalendarClock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clientService } from "@/services/api/clientService";
import { IClient, IClientFilters, IClientStatistics } from "@/types/client";
import { ClientForm } from "@/components/forms/client/ClientForm";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Clients = () => {
  // États
  const [filters, setFilters] = useState<IClientFilters>({
    search: "",
    isArchived: false,
    hasUpcomingAppointments: false,
    hasBirthday: false,
    sortBy: "name",
    sortOrder: "asc",
    page: 1,
    limit: 10,
  });
  const [clients, setClients] = useState<IClient[]>([]);
  const [statistics, setStatistics] = useState<IClientStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<IClient[]>([]);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Chargement initial des données
  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allClients, stats, birthdays] = await Promise.all([
        clientService.getAll(),
        clientService.getStatistics(),
        clientService.getUpcomingBirthdays(7)
      ]);

      // Appliquer les filtres
      let filteredClients = allClients;

      // Filtre de recherche
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredClients = filteredClients.filter(client =>
          `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.phone.toLowerCase().includes(searchLower)
        );
      }

      // Filtre des archives
      if (filters.isArchived !== undefined) {
        filteredClients = filteredClients.filter(client => client.isArchived === filters.isArchived);
      }

      // Filtre des anniversaires
      if (filters.hasBirthday) {
        filteredClients = filteredClients.filter(client => birthdays.some(b => b._id === client._id));
      }
      console.log(filteredClients)

      // Tri
      filteredClients.sort((a, b) => {
        const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
        switch (filters.sortBy) {
          case 'name':
            return sortOrder * (`${a.firstName} ${a.lastName}`).localeCompare(`${b.firstName} ${b.lastName}`);
          case 'createdAt':
            return sortOrder * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          case 'lastVisit':
            if (!a.lastVisit) return 1;
            if (!b.lastVisit) return -1;
            return sortOrder * (new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime());
          default:
            return 0;
        }
      });

      setClients(filteredClients);
      setStatistics(stats);
      setUpcomingBirthdays(birthdays);
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la création d'un nouveau client
  const handleNewClient = async (data: any) => {
    try {
      await clientService.create(data);
      toast({
        title: "Client ajouté",
        description: "Le nouveau client a été ajouté avec succès.",
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

  // Pagination
  const totalPages = Math.ceil(clients.length / filters.limit!);
  const startIndex = (filters.page! - 1) * filters.limit!;
  const endIndex = startIndex + filters.limit!;
  const currentClients = clients.slice(startIndex, endIndex);

  // Actions sur les clients
  const handleArchiveClient = async (clientId: string, archive: boolean) => {
    try {
      if (archive) {
        await clientService.archive(clientId);
      } else {
        await clientService.unarchive(clientId);
      }
      toast({
        title: archive ? "Client archivé" : "Client désarchivé",
        description: `Le client a été ${archive ? "archivé" : "désarchivé"} avec succès.`,
      });
      fetchData();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total clients</p>
              <p className="text-2xl font-bold">{statistics?.total || 0}</p>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Nouveaux ce mois</p>
              <p className="text-2xl font-bold">{statistics?.newThisMonth || 0}</p>
            </div>
            <Plus className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rendez-vous à venir</p>
              <p className="text-2xl font-bold">{statistics?.appointments.upcoming || 0}</p>
            </div>
            <CalendarClock className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Anniversaires ce mois</p>
              <p className="text-2xl font-bold">{statistics?.birthdays || 0}</p>
            </div>
            <Cake className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Barre d'actions */}
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

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Rechercher un client..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="pl-10"
          />
        </div>
        <Select
          value={filters.sortBy}
          onValueChange={(value: any) => setFilters({ ...filters, sortBy: value, page: 1 })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trier par..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nom</SelectItem>
            <SelectItem value="createdAt">Date d'inscription</SelectItem>
            <SelectItem value="lastVisit">Dernière visite</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => setFilters({ ...filters, isArchived: false, page: 1 })}>
              Clients actifs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters({ ...filters, isArchived: true, page: 1 })}>
              Clients archivés
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilters({ ...filters, hasBirthday: !filters.hasBirthday, page: 1 })}>
              {filters.hasBirthday ? "✓ " : ""} Anniversaires à venir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Liste des anniversaires à venir */}
      {upcomingBirthdays.length > 0 && (
        <Card className="p-4 bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <Cake className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium">Anniversaires à venir</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {upcomingBirthdays.map((client) => (
              <Badge
                key={client._id}
                variant="secondary"
                className="cursor-pointer hover:bg-blue-200"
                onClick={() => navigate(`/clients/${client._id}`)}
              >
                {client.firstName} {client.lastName} - {format(new Date(client.birthDate!), 'dd MMMM', { locale: fr })}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Liste des clients */}
      <div className="grid gap-4">
        {currentClients.map((client) => (
          <Card
            key={client._id}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-lg">
                    {client.firstName} {client.lastName}
                  </h3>
                  {client.isArchived && (
                    <Badge variant="secondary">Archivé</Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center text-gray-500 hover:text-gray-700">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="text-sm truncate">{client.email}</span>
                      </TooltipTrigger>
                      <TooltipContent>{client.email}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                      <span className="text-sm truncate">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/clients/${client._id}`)}
                >
                  Détails
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {client.isArchived ? (
                      <DropdownMenuItem onClick={() => handleArchiveClient(client._id, false)}>
                        <Archive className="w-4 h-4 mr-2" />
                        Désarchiver
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleArchiveClient(client._id, true)}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archiver
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page! - 1) })}
            disabled={filters.page === 1}
          >
            Précédent
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === filters.page ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, page })}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page! + 1) })}
            disabled={filters.page === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
};

export default Clients;