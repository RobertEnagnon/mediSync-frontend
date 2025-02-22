
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { StatCard } from "@/components/Dashboard/StatCard";
import { Calendar, Users, Clock, TrendingUp } from "lucide-react";
import { appointmentService } from "@/services/api/appointmentService";
import { clientService } from "@/services/api/clientService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    monthlyGrowth: 0
  });
 
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clients, appointments] = await Promise.all([
            clientService.getAll(),
          appointmentService.getAll()
        ]);

        const today = new Date();
        const upcomingAppts = appointments.filter(apt => 
          new Date(apt.date) > today
        ).length;

        setStats({
          totalClients: clients.length,
          totalAppointments: appointments.length,
          upcomingAppointments: upcomingAppts,
          monthlyGrowth: 12 // Exemple - à implémenter avec des vraies données
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={<Users className="w-6 h-6" />}
            trend={{ value: stats.monthlyGrowth, isPositive: true }}
          />
          <StatCard
            title="Total Rendez-vous"
            value={stats.totalAppointments}
            icon={<Calendar className="w-6 h-6" />}
          />
          <StatCard
            title="Rendez-vous à venir"
            value={stats.upcomingAppointments}
            icon={<Clock className="w-6 h-6" />}
          />
          <StatCard
            title="Croissance mensuelle"
            value={`${stats.monthlyGrowth}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            trend={{ value: stats.monthlyGrowth, isPositive: true }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;