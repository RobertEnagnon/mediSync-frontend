import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IAppointment, AppointmentType } from '@/types/appointment';
import { toast } from 'sonner';

const appointmentTypes: { value: AppointmentType; label: string }[] = [
  { value: 'meeting', label: 'Réunion' },
  { value: 'training', label: 'Formation' },
  { value: 'holiday', label: 'Congé' },
  { value: 'other', label: 'Autre' }
];

interface AppointmentFormProps {
  onSubmit: (data: Partial<IAppointment>) => void;
  onCancel: () => void;
  initialData?: Partial<IAppointment>;
}

const AppointmentForm = ({ onSubmit, onCancel, initialData }: AppointmentFormProps) => {
  const [formData, setFormData] = useState<Partial<IAppointment>>(initialData || {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'meeting',
    location: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des dates
    if (!formData.startDate || !formData.endDate) {
      toast.error('Les dates de début et de fin sont requises');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error('Dates invalides');
      return;
    }

    if (start >= end) {
      toast.error('La date de début doit être antérieure à la date de fin');
      return;
    }

    onSubmit({
      ...formData,
      title: formData.title || 'Rendez-vous',
      type: formData.type || 'meeting'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Date de début</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Date de fin</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Lieu</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Optionnel"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value: AppointmentType) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un type" />
          </SelectTrigger>
          <SelectContent>
            {appointmentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {initialData ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
};

export default AppointmentForm;
