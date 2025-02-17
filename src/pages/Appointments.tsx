import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppointmentService } from "@/services/api/appointmentService";

const Appointments = () => {
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await AppointmentService.getAll();
        setAppointments(data);
      } catch (err) {
        setError(err.message);
        toast({ title: "Erreur", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleNewAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Rendez-vous créé",
      description: "Le rendez-vous a été ajouté avec succès.",
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Rendez-vous</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau rendez-vous
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau rendez-vous</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleNewAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Input id="client" placeholder="Nom du client" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Heure</Label>
                    <Input id="time" type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input id="type" placeholder="Type de rendez-vous" />
                </div>
                <Button type="submit" className="w-full">
                  Créer le rendez-vous
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Rechercher un rendez-vous..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </Button>
        </div>

        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-medium">{appointment.client}</h3>
                  <p className="text-sm text-gray-500">{appointment.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{appointment.time}</p>
                    <p className="text-sm text-gray-500">{appointment.date}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;