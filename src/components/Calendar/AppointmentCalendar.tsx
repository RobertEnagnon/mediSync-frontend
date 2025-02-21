// src/components/Calendar/AppointmentCalendar.tsx
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const AppointmentCalendar = ({ appointments }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const appointmentDates = appointments.map(apt => new Date(apt.date));

  return (
    <Card className="p-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        locale={fr}
        modifiers={{
          hasAppointment: appointmentDates
        }}
        modifiersStyles={{
          hasAppointment: {
            backgroundColor: 'var(--primary)',
            color: 'white',
            borderRadius: '50%'
          }
        }}
      />
      <div className="mt-4">
        <h3 className="font-semibold">
          Rendez-vous du {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
        </h3>
        {/* Liste des rendez-vous pour la date sélectionnée */}
      </div>
    </Card>
  );
};

export default AppointmentCalendar;