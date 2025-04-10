import { useState, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, Clock, Plus, Filter, ChevronLeft, ChevronRight, Users, MapPin, Calendar as CalendarIconBase, Download } from "lucide-react";
import { format, startOfMonth, endOfMonth, isToday, isSameDay, isSameMonth, parseISO, startOfWeek, endOfWeek, addDays, startOfDay, endOfDay, addWeeks, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { EventService } from '@/services/api/eventService';
import { useToast } from '@/hooks/use-toast';
import { Event } from "@/types/event";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { DayContent } from "react-day-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ViewMode = 'month' | 'week' | 'day';

const EventType = {
  APPOINTMENT: 'appointment',
  SURGERY: 'surgery',
  CONSULTATION: 'consultation',
  MEETING: 'meeting',
} as const;

type EventType = typeof EventType[keyof typeof EventType];

type EventWithDate = Omit<Event, 'date' | 'type'> & {
  date: string;
  type: EventType;
};

interface DraggableEventProps {
  event: EventWithDate;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

const DraggableEvent = ({ event, onDragStart, onDragEnd, children }: DraggableEventProps) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', event.id);
    onDragStart(e);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className="cursor-move"
    >
      {children}
    </div>
  );
};

const getEventTypeColor = (type: EventType) => {
  switch (type) {
    case 'appointment':
      return 'bg-blue-500';
    case 'surgery':
      return 'bg-red-500';
    case 'consultation':
      return 'bg-green-500';
    case 'meeting':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

const getEventTypeLightColor = (type: EventType) => {
  switch (type) {
    case 'appointment':
      return 'bg-blue-100';
    case 'surgery':
      return 'bg-red-100';
    case 'consultation':
      return 'bg-green-100';
    case 'meeting':
      return 'bg-purple-100';
    default:
      return 'bg-gray-100';
  }
};

const getEventTypeBorderColor = (type: EventType) => {
  switch (type) {
    case 'appointment':
      return 'border-l-blue-500';
    case 'surgery':
      return 'border-l-red-500';
    case 'consultation':
      return 'border-l-green-500';
    case 'meeting':
      return 'border-l-purple-500';
    default:
      return 'border-l-gray-500';
  }
};

const Calendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<EventWithDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const eventTypes = [
    { value: EventType.APPOINTMENT, label: "Rendez-vous" },
    { value: EventType.SURGERY, label: "Chirurgie" },
    { value: EventType.CONSULTATION, label: "Consultation" },
    { value: EventType.MEETING, label: "Réunion" },
  ] as const;

  const fetchEvents = async (start: Date, end: Date) => {
    try {
      const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
      if (!token) {
        navigate('/login', { state: { from: '/calendar' } });
        return;
      }

      setLoading(true);
      const data = await EventService.getByDateRange(start.toISOString(), end.toISOString());
      setEvents(data.map(event => ({ ...event, date: format(parseISO(event.date), 'yyyy-MM-dd'), type: event.type as EventType })));
      setError(null);
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes('Non autorisé')) {
        navigate('/login', { state: { from: '/calendar' } });
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les événements',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const eventId = e.dataTransfer.getData('text/plain');
    setDraggingEventId(eventId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetDate: Date) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.add('bg-blue-50/50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.classList.remove('bg-blue-50/50');
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetDate: Date) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.remove('bg-blue-50/50');
    
    if (!draggingEventId) return;

    const draggedEvent = events.find(e => e.id === draggingEventId);
    if (!draggedEvent) return;

    try {
      const formattedDate = format(targetDate, 'yyyy-MM-dd');
      await EventService.update(draggingEventId, {
        ...draggedEvent,
        date: formattedDate
      });

      toast({
        title: "Événement déplacé",
        description: `L'événement a été déplacé au ${format(targetDate, 'dd/MM/yyyy')}`,
      });

      let start: Date;
      let end: Date;

      switch (viewMode) {
        case 'month':
          start = startOfMonth(date);
          end = endOfMonth(date);
          break;
        case 'week':
          start = startOfWeek(date, { locale: fr });
          end = endOfWeek(date, { locale: fr });
          break;
        case 'day':
          start = startOfDay(date);
          end = endOfDay(date);
          break;
      }

      fetchEvents(start, end);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de déplacer l'événement",
        variant: "destructive",
      });
    } finally {
      setDraggingEventId(null);
    }
  };

  const handleDragEnd = () => {
    setDraggingEventId(null);
  };

  const generateICalFile = () => {
    const calendar = {
      events: events.map(event => {
        const eventDate = parseISO(event.date);
        const [startHour, startMinute] = event.startTime.split(':').map(Number);
        const [endHour, endMinute] = event.endTime.split(':').map(Number);

        const start = new Date(eventDate);
        start.setHours(startHour, startMinute);

        const end = new Date(eventDate);
        end.setHours(endHour, endMinute);

        return {
          start: start.toISOString(),
          end: end.toISOString(),
          summary: event.title,
          description: event.description,
          location: event.location,
        };
      }),
    };

    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MediSync Pro//Calendar//FR
${calendar.events.map(event => `BEGIN:VEVENT
DTSTART:${event.start.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}
DTEND:${event.end.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}
SUMMARY:${event.summary}
${event.description ? `DESCRIPTION:${event.description}\n` : ''}${event.location ? `LOCATION:${event.location}\n` : ''}END:VEVENT`).join('\n')}
END:VCALENDAR`;

    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `medisync-calendar-${format(date, 'yyyy-MM-dd')}.ics`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let start: Date;
    let end: Date;

    switch (viewMode) {
      case 'month':
        start = startOfMonth(date);
        end = endOfMonth(date);
        break;
      case 'week':
        start = startOfWeek(date, { locale: fr });
        end = endOfWeek(date, { locale: fr });
        break;
      case 'day':
        start = startOfDay(date);
        end = endOfDay(date);
        break;
    }

    fetchEvents(start, end);
  }, [date, viewMode]);

  const filteredEvents = useMemo(() => {
    if (selectedType === "all") return events;
    return events.filter(event => event.type === selectedType);
  }, [events, selectedType]);

  const getEventsForDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) return [];
    return filteredEvents.filter(event => 
      isSameDay(parseISO(event.date), date)
    );
  };

  const selectedDateEvents = useMemo(() => 
    getEventsForDate(date),
    [date, filteredEvents]
  );

  const handleCreateEvent = () => {
    navigate('/events', { state: { defaultDate: date } });
  };

  const handleExportCalendar = () => {
    generateICalFile();
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'month':
        setDate(prev => new Date(prev.getFullYear(), prev.getMonth() + (direction === 'next' ? 1 : -1)));
        break;
      case 'week':
        setDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
        break;
      case 'day':
        setDate(prev => new Date(prev.setDate(prev.getDate() + (direction === 'next' ? 1 : -1))));
        break;
    }
  };

  const renderEventIndicator = (dayDate: Date) => {
    const dayEvents = events.filter(event => isSameDay(parseISO(event.date), dayDate));
    
    if (dayEvents.length === 0) {
      return null;
    }

    return (
      <div className="flex gap-0.5 mt-1">
        {dayEvents.slice(0, 3)?.map((event,i) => (
          <TooltipProvider key={i}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full cursor-pointer",
                    getEventTypeColor(event.type)
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{event.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {dayEvents.length > 3 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{dayEvents.length - 3} événements supplémentaires</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  const WeekView = () => {
    const weekStart = startOfWeek(date, { locale: fr });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            onDragOver={(e) => handleDragOver(e, day)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, day)}
            className={cn(
              "min-h-[150px] p-2 border rounded-md",
              isToday(day) && "bg-blue-50",
              !isSameMonth(day, date) && "text-gray-400"
            )}
          >
            <div className="font-medium mb-2">
              {format(day, 'EEEE d', { locale: fr })}
            </div>
            {getEventsForDate(day).map((event, eventIndex) => (
              <DraggableEvent
                key={eventIndex}
                event={event}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={cn(
                        "text-sm p-1 mb-1 rounded",
                        getEventTypeLightColor(event.type)
                      )}
                    >
                      {event.title}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-xs">{event.startTime} - {event.endTime}</p>
                      {event.location && (
                        <p className="text-xs">{event.location}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </DraggableEvent>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const DayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = getEventsForDate(date);

    return (
      <div className="space-y-2">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-12 gap-2">
            <div className="col-span-1 text-right text-sm text-gray-500">
              {hour}:00
            </div>
            <div className="col-span-11 min-h-[60px] border-l pl-2">
              {dayEvents
                .filter(event => {
                  const eventHour = parseInt(event.startTime.split(':')[0]);
                  return eventHour === hour;
                })
                .map((event, index) => (
                  <DraggableEvent
                    key={index}
                    event={event}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          className={cn(
                            "text-sm p-2 mb-1 rounded",
                            getEventTypeLightColor(event.type)
                          )}
                        >
                          {event.title}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs">{event.startTime} - {event.endTime}</p>
                          {event.location && (
                            <p className="text-xs">{event.location}</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </DraggableEvent>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const CustomDay = ({ date: dayDate, ...props }: { date: Date }) => {
    if (!dayDate || isNaN(dayDate.getTime())) {
      return <div {...props} />;
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDate(dayDate);
    };

    return (
      <div
        {...props}
        onClick={handleClick}
        onDragOver={(e) => handleDragOver(e, dayDate)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, dayDate)}
        className={cn(
          "w-full h-full p-2 flex flex-col",
          isToday(dayDate) && "bg-blue-50 font-bold",
          isSameDay(dayDate, date) && !isToday(dayDate) && "bg-gray-100 font-semibold",
          !isSameMonth(dayDate, date) && "text-gray-400",
          "hover:bg-gray-100 cursor-pointer rounded-md transition-colors"
        )}
      >
        <span>{format(dayDate, 'd')}</span>
        {renderEventIndicator(dayDate)}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Calendrier</h1>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Vue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mois</SelectItem>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="day">Jour</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleCreateEvent}>
                  Nouvel événement
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCalendar}>
                  Exporter (iCal)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {format(date, viewMode === 'month' ? 'MMMM yyyy' : 'dd MMMM yyyy', { locale: fr })}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleNavigate('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleNavigate('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {viewMode === 'month' && (
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  className="rounded-md border"
                  components={{
                    Day: CustomDay
                  }}
                  locale={fr}
                />
              )}
              {viewMode === 'week' && <WeekView />}
              {viewMode === 'day' && <DayView />}
            </div>
          )}
        </Card>

        {(viewMode === 'month' || viewMode === 'week') && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Événements du {format(date, 'dd MMMM', { locale: fr })}
              </h2>
              <Badge variant="outline">
                {selectedDateEvents.length} événement(s)
              </Badge>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 3 })?.map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))
                ) : selectedDateEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun événement ce jour
                  </div>
                ) : (
                  selectedDateEvents.map((event) => (
                    <DraggableEvent
                      key={event.id}
                      event={event}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <Card
                        className={cn(
                          "p-4 border-l-4",
                          getEventTypeBorderColor(event.type)
                        )}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{event.title}</h3>
                            <Badge variant="outline">
                              {eventTypes.find(t => t.value === event.type)?.label}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{event.startTime} - {event.endTime}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>

                          {event.participants && event.participants.length > 0 && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Users className="w-4 h-4" />
                              <span>{event.participants.length} participant(s)</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    </DraggableEvent>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default Calendar;