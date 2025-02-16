import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { appointmentService } from "@/services/localStorageService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AppointmentCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: appointmentService.getAll,
  });

  const appointmentsForDate = (date: Date) => {
    return appointments.filter(apt => apt.date === date.toISOString().split('T')[0]);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Calendrier</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        
        <div className="space-y-4">
          <h3 className="font-medium">
            Rendez-vous du {date?.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <div className="space-y-2">
            {date && appointmentsForDate(date).map(apt => (
              <Card key={apt.id} className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{apt.title}</p>
                    <p className="text-sm text-gray-500">{apt.time}</p>
                  </div>
                  <Badge>{apt.status}</Badge>
                </div>
              </Card>
            ))}
            {date && appointmentsForDate(date).length === 0 && (
              <p className="text-gray-500 text-sm">Aucun rendez-vous pour cette date</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;