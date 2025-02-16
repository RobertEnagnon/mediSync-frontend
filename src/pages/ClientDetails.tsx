import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Mail, Phone, User } from "lucide-react";

const ClientDetails = () => {
  const { id } = useParams();

  // Données de démonstration
  const client = {
    id: Number(id),
    name: "Jean Dupont",
    email: "jean.dupont@email.com",
    phone: "06 12 34 56 78",
    address: "123 Rue de Paris, 75001 Paris",
    registrationDate: "01/01/2024",
    lastVisit: "15/04/2024",
    totalVisits: 5,
  };

  const appointments = [
    {
      date: "15/04/2024",
      time: "09:00",
      type: "Consultation",
      status: "Terminé",
    },
    {
      date: "01/04/2024",
      time: "14:30",
      type: "Suivi",
      status: "Terminé",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Détails du client</h1>
          <div className="flex gap-2">
            <Button variant="outline">Modifier</Button>
            <Button variant="destructive">Supprimer</Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-medium">{client.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Date d'inscription</p>
                  <p className="font-medium">{client.registrationDate}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dernière visite</p>
                <p className="font-medium">{client.lastVisit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nombre total de visites</p>
                <p className="font-medium">{client.totalVisits}</p>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="appointments" className="w-full">
          <TabsList>
            <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="appointments">
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <Card key={index} className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <p className="font-medium">{appointment.type}</p>
                      <p className="text-sm text-gray-500">{appointment.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{appointment.time}</p>
                      <p className="text-sm text-gray-500">{appointment.date}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="notes">
            <Card className="p-6">
              <p className="text-gray-500">Aucune note pour le moment.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ClientDetails;