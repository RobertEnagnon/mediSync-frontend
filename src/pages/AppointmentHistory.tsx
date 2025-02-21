import { useState, useEffect } from "react";
import { format } from "date-fns";
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
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: "completed" | "cancelled" | "no-show";
  type: string;
  notes?: string;
}

const AppointmentHistory = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
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
      const response = await fetch("/api/appointments/history");
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des rendez-vous",
        variant: "destructive",
      });
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
          apt.patientName.toLowerCase().includes(searchLower) ||
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

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Terminé</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annulé</Badge>;
      case "no-show":
        return <Badge variant="secondary">Non présenté</Badge>;
      default:
        return null;
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Heure", "Patient", "Type", "Statut", "Notes"];
    const csvContent = [
      headers.join(","),
      ...filteredAppointments.map((apt) =>
        [
          apt.date,
          apt.time,
          apt.patientName,
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
                placeholder="Rechercher un patient ou un type..."
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
                  <SelectItem value="no-show">Non présenté</SelectItem>
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
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {format(new Date(appointment.date), "dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.patientName}</TableCell>
                    <TableCell>{appointment.type}</TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>{appointment.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentHistory;
