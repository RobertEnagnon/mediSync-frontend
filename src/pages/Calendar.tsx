import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { EventService } from '@/services/api/eventService'; // Importer le service des événements
import { useToast } from '@/hooks/use-toast';

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState([]); // État pour stocker les événements
  const [loading, setLoading] = useState(true); // État pour gérer le chargement
  const [error, setError] = useState(null); // État pour gérer les erreurs
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await EventService.getAll(); // Récupérer la liste des événements
        setEvents(data);
      } catch (err) {
        setError(err.message); // Gérer les erreurs
        toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false); // Fin du chargement
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div>Loading...</div>; // Afficher un message de chargement
  if (error) return <div>Error: {error}</div>; // Afficher un message d'erreur

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Calendrier</h1>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <span className="text-gray-500">
              {date?.toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-6 lg:col-span-2">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </Card>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Événements du jour</h2>
            {events.map((event, index) => (
              <Card
                key={event.id}
                className={cn(
                  "p-4 border-l-4",
                  event.type === "Rendez-vous"
                    ? "border-l-blue-500"
                    : "border-l-green-500"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-500">{event.type}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{event.time}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Durée: {event.duration}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;