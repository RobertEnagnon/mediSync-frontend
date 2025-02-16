import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AppointmentBasicInfoProps {
  title: string;
  date: string;
  time: string;
  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}

const AppointmentBasicInfo = ({
  title,
  date,
  time,
  onTitleChange,
  onDateChange,
  onTimeChange,
}: AppointmentBasicInfoProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Titre du rendez-vous"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Heure</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            required
          />
        </div>
      </div>
    </>
  );
};

export default AppointmentBasicInfo;