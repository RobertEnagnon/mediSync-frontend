import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bell,
  Calendar,
  Users,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface StatisticsData {
  totalAppointments: number;
  upcomingAppointments: number;
  totalClients: number;
  activeClients: number;
  totalDocuments: number;
  recentDocuments: number;
  unreadNotifications: number;
  totalNotifications: number;
  averageSessionDuration: number;
  clientGrowthRate: number;
}
import { API_BASE_URL,getAuthToken } from '@/services/api/config';

export default function Statistics({ statsFromDashboard }: { statsFromDashboard: any }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatisticsData | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/statistics/dashboard`,{
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-secondary rounded w-1/3"></div>
              <div className="h-8 bg-secondary rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-secondary rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Rendez-vous",
      // value: stats.totalAppointments,
      value: statsFromDashboard.totalAppointments,
      // description: `${stats.upcomingAppointments} rendez-vous à venir`,
      description: `${statsFromDashboard.totalAppointments} rendez-vous à venir`,
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      title: "Clients",
      // value: stats.totalClients,
      value: statsFromDashboard.totalClients,
      // description: `${stats.activeClients} clients actifs`,
      description: `${statsFromDashboard.totalClients} clients actifs`,
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Documents",
      value: stats.totalDocuments,
      description: `${stats.recentDocuments} documents récents`,
      icon: FileText,
      color: "text-yellow-500",
    },
    {
      title: "Notifications",
      value: stats.totalNotifications,
      description: `${stats.unreadNotifications} non lues`,
      icon: Bell,
      color: "text-red-500",
    },
    {
      title: "Durée moyenne",
      value: `${stats.averageSessionDuration} min`,
      description: "Durée moyenne des consultations",
      icon: Clock,
      color: "text-purple-500",
    },
    {
      title: "Croissance",
      value: `${stats.clientGrowthRate}%`,
      description: "Taux de croissance des clients",
      icon: TrendingUp,
      color: "text-indigo-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
