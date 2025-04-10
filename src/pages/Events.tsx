import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { EventService } from '@/services/api/eventService';
import { Calendar as CalendarIcon, Clock, Plus, Search, MapPin, Users, RepeatIcon, BellIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Event, EventType, EventStatus, RecurrenceFrequency } from '@/types/event';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { TimeInput } from '@/components/ui/time-input';

const ITEMS_PER_PAGE = 10;

const eventTypes = [
  { value: 'appointment', label: 'Rendez-vous' },
  { value: 'meeting', label: 'Réunion' },
  { value: 'break', label: 'Pause' },
  { value: 'holiday', label: 'Congé' },
  { value: 'other', label: 'Autre' }
];

const eventStatuses = [
  { value: 'scheduled', label: 'Planifié' },
  { value: 'ongoing', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' }
];

const recurrenceFrequencies = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuel' },
  { value: 'yearly', label: 'Annuel' }
];

const weekDays = [
  { value: '0', label: 'Dimanche' },
  { value: '1', label: 'Lundi' },
  { value: '2', label: 'Mardi' },
  { value: '3', label: 'Mercredi' },
  { value: '4', label: 'Jeudi' },
  { value: '5', label: 'Vendredi' },
  { value: '6', label: 'Samedi' }
];

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: new Date(),
    endDate: new Date()
  });
  const [filters, setFilters] = useState({
    type: '',
    status: ''
  });

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    type: 'appointment',
    status: 'scheduled',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    duration: 60,
    color: '#4F46E5',
    isRecurring: false,
    recurrencePattern: {
      frequency: 'daily',
      interval: 1,
      endDate: new Date(),
      daysOfWeek: []
    },
    reminder: {
      enabled: false,
      timing: 30
    }
  });

  const { toast } = useToast();

  // Fonction pour charger les événements selon le tab actif
  const loadEvents = async () => {
    try {
      setLoading(true);
      let data: Event[];

      switch (activeTab) {
        case 'today':
          data = await EventService.getTodayEvents();
          break;
        case 'upcoming':
          data = await EventService.getUpcoming(7);
          break;
        case 'date-range':
          data = await EventService.getByDateRange(dateRange.startDate, dateRange.endDate);
          break;
        default:
          data = await EventService.getAll();
      }

      setEvents(data);
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [activeTab, dateRange]);

  // Fonction pour créer un événement
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newEvent.isRecurring && newEvent.recurrencePattern) {
        await EventService.createRecurring(newEvent as Omit<Event, 'id'>, newEvent.recurrencePattern);
      } else {
        const { recurrencePattern, ...eventData } = newEvent;
        await EventService.create(eventData as Omit<Event, 'id'>);
      }
      
      toast({
        title: 'Succès',
        description: 'Événement créé avec succès',
      });
      setDialogOpen(false);
      loadEvents();
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création de l\'événement',
        variant: 'destructive',
      });
    }
  };

  // Fonction pour mettre à jour le statut d'un événement
  const handleStatusUpdate = async (id: string, status: EventStatus) => {
    try {
      await EventService.updateStatus(id, status);
      toast({
        title: 'Succès',
        description: 'Statut mis à jour avec succès'
      });
      loadEvents();
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  // Fonction pour supprimer un événement
  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      await EventService.delete(id);
      toast({
        title: 'Succès',
        description: 'Événement supprimé avec succès'
      });
      loadEvents();
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  // Fonction pour rechercher des événements
  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await EventService.search(search, {
        type: filters.type,
        status: filters.status
      });
      setEvents(data);
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search || filters.type || filters.status) {
      handleSearch();
    } else {
      loadEvents();
    }
  }, [search, filters]);

  // Filtrer les événements pour la pagination
  const filteredEvents = events?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des événements</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel événement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouvel événement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newEvent?.type || 'appointment'}
                    onValueChange={(value) =>
                      setNewEvent({ ...newEvent, type: value as EventType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type d'événement" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={newEvent.status || 'scheduled'}
                    onValueChange={(value) =>
                      setNewEvent({ ...newEvent, status: value as EventStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventStatuses?.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <DatePicker
                    date={newEvent.date}
                    onDateChange={(date) =>
                      setNewEvent({ ...newEvent, date })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heure de début</Label>
                  <TimeInput
                    value={newEvent.startTime}
                    onChange={(time) =>
                      setNewEvent({ ...newEvent, startTime: time })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Récurrence</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newEvent.isRecurring}
                    onCheckedChange={(checked) =>
                      setNewEvent({ ...newEvent, isRecurring: checked })
                    }
                  />
                  <span>Activer la récurrence</span>
                </div>
              </div>
              {newEvent?.isRecurring && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Fréquence</Label>
                    <Select
                      value={newEvent?.recurrencePattern?.frequency || 'daily'}
                      onValueChange={(value) =>
                        setNewEvent({
                          ...newEvent,
                          recurrencePattern: {
                            ...newEvent.recurrencePattern,
                            frequency: value as RecurrenceFrequency
                          }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Fréquence" />
                      </SelectTrigger>
                      <SelectContent>
                        {recurrenceFrequencies?.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {newEvent?.recurrencePattern?.frequency === 'weekly' && (
                    <div className="space-y-2">
                      <Label>Jours de la semaine</Label>
                      <Select
                        value={newEvent?.recurrencePattern?.daysOfWeek?.[0]?.toString() || '1'}
                        onValueChange={(value) =>
                          setNewEvent({
                            ...newEvent,
                            recurrencePattern: {
                              ...newEvent.recurrencePattern,
                              daysOfWeek: [parseInt(value)]
                            }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Jours" />
                        </SelectTrigger>
                        <SelectContent>
                          {weekDays.map((day) => (
                            <SelectItem key={day.value} value={day.value}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label>Rappel</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newEvent?.reminder?.enabled}
                    onCheckedChange={(checked) =>
                      setNewEvent({
                        ...newEvent,
                        reminder: { ...newEvent.reminder!, enabled: checked }
                      })
                    }
                  />
                  <span>Activer le rappel</span>
                </div>
                {newEvent?.reminder?.enabled && (
                  <div className="mt-2">
                    <Label>Minutes avant l'événement</Label>
                    <Input
                      type="number"
                      value={newEvent.reminder.timing}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          reminder: {
                            ...newEvent.reminder!,
                            timing: parseInt(e.target.value)
                          }
                        })
                      }
                      min="1"
                      max="1440"
                    />
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full">
                Créer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un événement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select
          value={filters?.type || ''}
          onValueChange={(value) => setFilters({ ...filters, type: value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Type d'événement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {eventTypes?.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters?.status || ''}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {eventStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="today">Aujourd'hui</TabsTrigger>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="date-range">Par date</TabsTrigger>
        </TabsList>

        <TabsContent value="date-range" className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <Label>Date de début</Label>
              <DatePicker
                date={dateRange.startDate}
                onDateChange={(date) =>
                  setDateRange({ ...dateRange, startDate: date })
                }
              />
            </div>
            <div>
              <Label>Date de fin</Label>
              <DatePicker
                date={dateRange.endDate}
                onDateChange={(date) =>
                  setDateRange({ ...dateRange, endDate: date })
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center">
            <span>Chargement...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun événement trouvé</p>
          </div>
        ) : (filteredEvents?.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)?.map((event,index) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{event.title}</h3>
                  {event.isRecurring && (
                    <RepeatIcon className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{event.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>
                    {eventTypes.find(t => t.value === event.type)?.label}
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {format(new Date(event.date), 'dd/MM/yyyy')}
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {event.startTime} - {event.endTime}
                  </Badge>
                  {event?.location && (
                    <Badge variant="outline" className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {event.location}
                    </Badge>
                  )}
                  {event?.participants && event.participants.length > 0 && (
                    <Badge variant="outline" className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {event.participants.length} participant(s)
                    </Badge>
                  )}
                  {event?.reminder?.enabled && (
                    <Badge variant="outline" className="flex items-center">
                      <BellIcon className="w-3 h-3 mr-1" />
                      Rappel {event.reminder.timing} min avant
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={event.status}
                  onValueChange={(value) => handleStatusUpdate(event.id!, value as EventStatus)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => handleDelete(event.id!)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </Card>
        )))}
      </div>

      {filteredEvents?.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredEvents.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default Events;
