
import { Clock, Calendar, User, Trash2, Edit, Filter } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { appointmentApiService } from "@/services/api/appointmentService";
import { clientApiService } from "@/services/api/clientService";
import { Appointment, Client } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

const AppointmentList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Appointment["status"] | "">("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: appointmentApiService.getAll,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: clientApiService.getAll,
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: appointmentApiService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Rendez-vous supprimé",
        description: "Le rendez-vous a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, appointment }: { id: string; appointment: Partial<Appointment> }) =>
      appointmentApiService.update(id, appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Rendez-vous modifié",
        description: "Le rendez-vous a été modifié avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la modification.",
        variant: "destructive",
      });
    },
  });

  const getClientName = (clientId: string) => {
    const client = clients.find((c: Client) => c.id === clientId);
    return client ? client.name : "Client inconnu";
  };

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleDelete = (id: string) => {
    deleteAppointmentMutation.mutate(id);
  };

  const handleUpdate = (appointment: Appointment) => {
    updateAppointmentMutation.mutate({
      id: appointment.id,
      appointment,
    });
  };

  const filteredAppointments = appointments
    .filter((apt: Appointment) => 
      apt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getClientName(apt.clientId).toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((apt: Appointment) => 
      statusFilter ? apt.status === statusFilter : true
    );

  if (isLoadingAppointments) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>Chargement des rendez-vous...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-xl font-semibold">Rendez-vous à venir</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          </div>
          <Select value={statusFilter} onValueChange={(value: Appointment["status"] | "") => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAppointments.map((appointment: Appointment) => (
          <Card key={appointment.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">{appointment.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>{getClientName(appointment.clientId)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 text-primary">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{appointment.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{appointment.date}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <Dialog open={isEditDialogOpen && selectedAppointment?.id === appointment.id} onOpenChange={(open) => {
                  setIsEditDialogOpen(open);
                  if (!open) setSelectedAppointment(null);
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifier le rendez-vous</DialogTitle>
                    </DialogHeader>
                    {selectedAppointment && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Titre</label>
                          <Input
                            value={selectedAppointment.title}
                            onChange={(e) => setSelectedAppointment({
                              ...selectedAppointment,
                              title: e.target.value
                            })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Date</label>
                            <Input
                              type="date"
                              value={selectedAppointment.date}
                              onChange={(e) => setSelectedAppointment({
                                ...selectedAppointment,
                                date: e.target.value
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Heure</label>
                            <Input
                              type="time"
                              value={selectedAppointment.time}
                              onChange={(e) => setSelectedAppointment({
                                ...selectedAppointment,
                                time: e.target.value
                              })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Statut</label>
                          <Select
                            value={selectedAppointment.status}
                            onValueChange={(value: Appointment["status"]) => setSelectedAppointment({
                              ...selectedAppointment,
                              status: value
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="completed">Terminé</SelectItem>
                              <SelectItem value="cancelled">Annulé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleUpdate(selectedAppointment)}
                        >
                          Enregistrer les modifications
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(appointment.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
          </Card>
        ))}
        {filteredAppointments.length === 0 && (
          <Card className="p-6 text-center text-gray-500">
            Aucun rendez-vous trouvé
          </Card>
        )}
      </div>
    </div>
  );
};

export default AppointmentList;
