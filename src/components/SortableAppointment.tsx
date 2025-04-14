import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { IAppointment } from '@/types/appointment';

interface SortableAppointmentProps {
  appointment: IAppointment;
}

export function SortableAppointment({ appointment }: SortableAppointmentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: appointment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return '--:--';
      }
      return format(date, 'HH:mm', { locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de la date:', error);
      return '--:--';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move"
    >
      <Card className="p-4 hover:bg-gray-50 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{appointment.title}</h3>
            <p className="text-sm text-gray-600">
              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
            </p>
            {appointment.location && (
              <p className="text-sm text-gray-600">
                📍 {appointment.location}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className={`inline-block px-2 py-1 rounded text-xs ${
              appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
              appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {appointment.status === 'completed' ? 'Terminé' :
               appointment.status === 'cancelled' ? 'Annulé' :
               'Prévu'}
            </span>
            <p className="text-sm text-gray-600 mt-1">
              {appointment.clientId.firstName} {appointment.clientId.lastName}
            </p>
          </div>
        </div>
        {appointment.description && (
          <p className="text-sm text-gray-600 mt-2">
            {appointment.description}
          </p>
        )}
      </Card>
    </div>
  );
}
