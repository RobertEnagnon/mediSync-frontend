import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { clientService } from "@/services/localStorageService";

interface AppointmentClientSelectProps {
  clientId: string;
  onClientChange: (value: string) => void;
}

const AppointmentClientSelect = ({
  clientId,
  onClientChange,
}: AppointmentClientSelectProps) => {
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: clientService.getAll,
  });

  return (
    <div className="space-y-2">
      <Label htmlFor="client">Client</Label>
      <Select value={clientId} onValueChange={onClientChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AppointmentClientSelect;