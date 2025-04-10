import { useState, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, Clock, Plus, Filter, ChevronLeft, ChevronRight, Users, MapPin, Calendar as CalendarIconBase } from "lucide-react";
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
import { Event, EventType } from "@/types/event";
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

const Calendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const { toast } = useToast();
  const navigate = useNavigate();

  const eventTypes = [
    { value: "appointment", label: "Rendez-vous" },
    { value: "surgery", label: "Chirurgie" },
    { value: "consultation", label: "Consultation" },
    { value: "meeting", label: "Réunion" },
  ];

  const fetchEvents = async (start: Date, end: Date) => {
    try {
      setLoading(true);
      const data = await EventService.getByDateRange(start, end);
      setEvents(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les événements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
    // TODO: Implémenter l'export iCal
    toast({
      title: "Export du calendrier",
      description: "Fonctionnalité en cours de développement",
    });
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

  const renderEventIndicator = (day: Date) => {
    if (!day || isNaN(day.getTime())) return null;
    const dayEvents = getEventsForDate(day);
    if (dayEvents.length === 0) return null;

    return (
      <div className="flex gap-1 mt-1">
        {dayEvents.slice(0, 3).map((event, index) => (
          <Tooltip key={index}>
            <TooltipTrigger>
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full cursor-pointer",
                  event.type === "appointment" && "bg-blue-500",
                  event.type === "surgery" && "bg-red-500",
                  event.type === "consultation" && "bg-green-500",
                  event.type === "meeting" && "bg-purple-500"
                )}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-gray-500">{event.startTime} - {event.endTime}</p>
                {event.location && (
                  <p className="text-xs text-gray-500">{event.location}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        {dayEvents.length > 3 && (
          <Tooltip>
            <TooltipTrigger>
              <span className="text-xs text-gray-500">+{dayEvents.length - 3}</span>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {dayEvents.slice(3).map((event, index) => (
                  <p key={index} className="text-sm">{event.title}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
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
              <Tooltip key={eventIndex}>
                <TooltipTrigger>
                  <div
                    className={cn(
                      "text-sm p-1 mb-1 rounded",
                      event.type === "appointment" && "bg-blue-100",
                      event.type === "surgery" && "bg-red-100",
                      event.type === "consultation" && "bg-green-100",
                      event.type === "meeting" && "bg-purple-100"
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
                  <Tooltip key={index}>
                    <TooltipTrigger>
                      <div
                        className={cn(
                          "text-sm p-2 mb-1 rounded",
                          event.type === "appointment" && "bg-blue-100",
                          event.type === "surgery" && "bg-red-100",
                          event.type === "consultation" && "bg-green-100",
                          event.type === "meeting" && "bg-purple-100"
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

    return (
      <div
        {...props}
        className={cn(
          "w-full h-full p-2 flex flex-col",
          isToday(dayDate) && "bg-blue-50 font-bold",
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
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))
                ) : selectedDateEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun événement ce jour
                  </div>
                ) : (
                  selectedDateEvents.map((event) => (
                    <Card
                      key={event.id}
                      className={cn(
                        "p-4 border-l-4",
                        event.type === "appointment" && "border-l-blue-500",
                        event.type === "surgery" && "border-l-red-500",
                        event.type === "consultation" && "border-l-green-500",
                        event.type === "meeting" && "border-l-purple-500"
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