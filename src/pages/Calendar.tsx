import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { IAppointment } from '@/types/appointment';
import appointmentService from '@/services/api/appointmentService';
import { SortableAppointment } from '@/components/SortableAppointment';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfDay, endOfDay, addHours, addMinutes, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import ical from 'ical-generator';

type ViewMode = 'day' | 'week' | 'month';

export default function Calendar() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [updating, setUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadAppointments();
  }, [date, viewMode]);

  const loadAppointments = async () => {
    try {
      let startDate: Date;
      let endDate: Date;

      switch (viewMode) {
        case 'week':
          startDate = startOfWeek(date, { locale: fr });
          endDate = endOfWeek(date, { locale: fr });
          break;
        case 'month':
          startDate = startOfMonth(date);
          endDate = endOfMonth(date);
          break;
        default: // day
          startDate = startOfDay(date);
          endDate = endOfDay(date);
      }

      const data = await appointmentService.getAll();
      const filteredAppointments = data.filter(appointment => {
        const appointmentDate = new Date(appointment.startTime);
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });

      setAppointments(filteredAppointments);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    }
  };

  const handleDragEnd = async (event: any) => {
    if (updating) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setUpdating(true);
    try {
      setAppointments((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Mettre à jour les horaires en fonction du nouvel ordre
        const updatedItems = newItems.map((item, index) => {
          const baseDate = startOfDay(date);
          const startTime = addMinutes(addHours(baseDate, 9), index * 30);
          const endTime = addMinutes(startTime, 30);
          
          return {
            ...item,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          };
        });

        // Mettre à jour le rendez-vous déplacé dans le backend
        const movedAppointment = updatedItems[newIndex];
        appointmentService.update(movedAppointment.id, {
          startTime: movedAppointment.startTime,
          endTime: movedAppointment.endTime,
        }).catch((error) => {
          console.error('Erreur lors de la mise à jour du rendez-vous:', error);
          loadAppointments(); // Recharger les rendez-vous en cas d'erreur
        }).finally(() => {
          setUpdating(false);
        });

        return updatedItems;
      });
    } catch (error) {
      console.error('Erreur lors du glisser-déposer:', error);
      setUpdating(false);
      loadAppointments(); // Recharger les rendez-vous en cas d'erreur
    }
  };

  const exportToIcal = () => {
    const calendar = ical({
      name: 'MediSync Pro - Rendez-vous',
      timezone: 'Europe/Paris',
    });

    appointments.forEach((appointment) => {
      calendar.createEvent({
        start: new Date(appointment.startTime),
        end: new Date(appointment.endTime),
        summary: appointment.title,
        description: appointment.description,
        location: appointment.location,
      });
    });

    const blob = new Blob([calendar.toString()], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'rendez-vous.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const days = viewMode === 'month' ? 30 : viewMode === 'week' ? 7 : 1;
    setDate(current => direction === 'next' ? addDays(current, days) : addDays(current, -days));
  };

  const groupAppointmentsByDay = () => {
    const groups: { [key: string]: IAppointment[] } = {};
    appointments.forEach(appointment => {
      const day = format(new Date(appointment.startTime), 'yyyy-MM-dd');
      if (!groups[day]) {
        groups[day] = [];
      }
      groups[day].push(appointment);
    });
    return groups;
  };

  return (
    <div className="container mx-auto p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Calendrier des rendez-vous</h1>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sélectionner une vue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Jour</SelectItem>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="icon" onClick={() => navigateDate('prev')} className="shrink-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full sm:w-[240px] justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {date ? format(date, 'PPP', { locale: fr }) : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => setDate(newDate || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" onClick={() => navigateDate('next')} className="shrink-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button onClick={exportToIcal} className="w-full sm:w-auto">
            Exporter en iCal
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={appointments.map(a => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {viewMode === 'day' ? (
            <div className="space-y-2">
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucun rendez-vous pour cette journée
                </div>
              ) : (
                appointments.map((appointment) => (
                  <SortableAppointment
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Object.entries(groupAppointmentsByDay()).map(([day, dayAppointments]) => (
                <div key={day} className="border rounded-lg p-4 bg-white shadow-sm">
                  <h3 className="font-semibold mb-2">
                    {format(new Date(day), 'EEEE d MMMM', { locale: fr })}
                  </h3>
                  <div className="space-y-2">
                    {dayAppointments.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        Aucun rendez-vous
                      </div>
                    ) : (
                      dayAppointments.map((appointment) => (
                        <SortableAppointment
                          key={appointment.id}
                          appointment={appointment}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
              {Object.keys(groupAppointmentsByDay()).length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Aucun rendez-vous pour cette période
                </div>
              )}
            </div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
}