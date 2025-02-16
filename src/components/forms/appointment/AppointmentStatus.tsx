import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AppointmentStatusProps {
  status: "pending" | "completed" | "cancelled";
  onStatusChange: (value: "pending" | "completed" | "cancelled") => void;
}

const AppointmentStatus = ({ status, onStatusChange }: AppointmentStatusProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="status">Statut</Label>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">En attente</SelectItem>
          <SelectItem value="completed">Terminé</SelectItem>
          <SelectItem value="cancelled">Annulé</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AppointmentStatus;