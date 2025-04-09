import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { appointmentService } from "@/services/api/appointmentService";
import { IAppointment, AppointmentStatus } from "@/types/appointment";

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: "all",
    search: "",
    dateRange: "all",
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getHistory();
      setAppointments(data);
    } catch (error: any) {
      console.error("Erreur lors du chargement de l'historique:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des rendez-vous",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Filtre par statut
    if (filter.status !== "all") {
      filtered = filtered.filter((apt) => apt.status === filter.status);
    }

    // Filtre par recherche
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.title.toLowerCase().includes(searchLower) ||
          apt.clientId.firstName.toLowerCase().includes(searchLower) ||
          apt.clientId.lastName.toLowerCase().includes(searchLower) ||
          apt.type.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par période
    const now = new Date();
    switch (filter.dateRange) {
      case "week":
        filtered = filtered.filter(
          (apt) =>
            new Date(apt.date) >= new Date(now.setDate(now.getDate() - 7))
        );
        break;
      case "month":
        filtered = filtered.filter(
          (apt) =>
            new Date(apt.date) >= new Date(now.setMonth(now.getMonth() - 1))
        );
        break;
      case "year":
        filtered = filtered.filter(
          (apt) =>
            new Date(apt.date) >= new Date(now.setFullYear(now.getFullYear() - 1))
        );
        break;
    }

    setFilteredAppointments(filtered);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig = {
      pending: { label: "En attente", color: "bg-blue-100 text-blue-800" },
      scheduled: { label: "Planifié", color: "bg-purple-100 text-purple-800" },
      confirmed: { label: "Confirmé", color: "bg-yellow-100 text-yellow-800" },
      completed: { label: "Terminé", color: "bg-green-100 text-green-800" },
      cancelled: { label: "Annulé", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = ["Date", "Heure", "Client", "Type", "Statut", "Notes"];
    const csvContent = [
      headers.join(","),
      ...filteredAppointments.map((apt) =>
        [
          format(parseISO(apt.date), "dd/MM/yyyy"),
          format(parseISO(apt.date), "HH:mm"),
          `${apt.clientId.firstName} ${apt.clientId.lastName}`,
          apt.type,
          apt.status,
          apt.notes || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `historique_rendez_vous_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historique des Rendez-vous</CardTitle>
          <Button onClick={exportToCSV}>Exporter en CSV</Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Input
                placeholder="Rechercher un client ou un type..."
                value={filter.search}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>
            <div>
              <Select
                value={filter.status}
                onValueChange={(value) =>
                  setFilter((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="scheduled">Planifié</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={filter.dateRange}
                onValueChange={(value) =>
                  setFilter((prev) => ({ ...prev, dateRange: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les dates</SelectItem>
                  <SelectItem value="week">7 derniers jours</SelectItem>
                  <SelectItem value="month">30 derniers jours</SelectItem>
                  <SelectItem value="year">12 derniers mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {format(parseISO(appointment.date), "dd MMMM yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(appointment.date), "HH:mm")}
                      </TableCell>
                      <TableCell>
                        {`${appointment.clientId.firstName} ${appointment.clientId.lastName}`}
                      </TableCell>
                      <TableCell>{appointment.type}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>{appointment.notes}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Aucun rendez-vous trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentHistory;
