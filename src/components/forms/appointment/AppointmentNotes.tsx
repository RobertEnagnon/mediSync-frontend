import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AppointmentNotesProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

const AppointmentNotes = ({ notes, onNotesChange }: AppointmentNotesProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Notes additionnelles..."
        className="min-h-[100px]"
      />
    </div>
  );
};

export default AppointmentNotes;