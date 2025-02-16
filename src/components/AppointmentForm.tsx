
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { appointmentApiService } from "@/services/api/appointmentService";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import AppointmentBasicInfo from "./forms/appointment/AppointmentBasicInfo";
import AppointmentClientSelect from "./forms/appointment/AppointmentClientSelect";
import AppointmentNotes from "./forms/appointment/AppointmentNotes";
import AppointmentStatus from "./forms/appointment/AppointmentStatus";

const AppointmentForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"pending" | "completed" | "cancelled">("pending");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAppointmentMutation = useMutation({
    mutationFn: appointmentApiService.create,
    onSuccess: () => {
      toast({
        title: "Rendez-vous créé",
        description: "Le rendez-vous a été ajouté avec succès.",
      });

      setTitle("");
      setDate("");
      setTime("");
      setClientId("");
      setNotes("");
      setStatus("pending");

      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création du rendez-vous.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createAppointmentMutation.mutate({
      title,
      date,
      time,
      clientId,
      notes,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Nouveau rendez-vous</h2>
      
      <AppointmentBasicInfo
        title={title}
        date={date}
        time={time}
        onTitleChange={setTitle}
        onDateChange={setDate}
        onTimeChange={setTime}
      />

      <AppointmentClientSelect
        clientId={clientId}
        onClientChange={setClientId}
      />

      <AppointmentNotes
        notes={notes}
        onNotesChange={setNotes}
      />

      <AppointmentStatus
        status={status}
        onStatusChange={setStatus}
      />

      <Button 
        type="submit" 
        className="w-full"
        disabled={createAppointmentMutation.isPending}
      >
        {createAppointmentMutation.isPending ? "Création en cours..." : "Ajouter le rendez-vous"}
      </Button>
    </form>
  );
};

export default AppointmentForm;
