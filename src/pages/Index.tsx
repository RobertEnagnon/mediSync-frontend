import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Calendar, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Rendez-vous aujourd'hui",
      value: "8",
      icon: Clock,
      color: "text-blue-500",
      link: "/appointments"
    },
    {
      title: "Total Clients",
      value: "124",
      icon: Users,
      color: "text-green-500",
      link: "/clients"
    },
    {
      title: "Cette semaine",
      value: "32",
      icon: Calendar,
      color: "text-purple-500",
      link: "/calendar"
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card 
              key={stat.title}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(stat.link)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Rendez-vous récents</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Jean Dupont</p>
                    <p className="text-sm text-gray-500">Consultation régulière</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">14:00</p>
                    <p className="text-sm text-gray-500">Aujourd'hui</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Nouveaux clients</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">Marie Martin</p>
                    <p className="text-sm text-gray-500">Inscrit il y a 2 jours</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;