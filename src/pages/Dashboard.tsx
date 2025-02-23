import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/api/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  Bell,
  TrendingUp,
  Clock,
  Ban,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

// Composant pour afficher un indicateur statistique
const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  trend?: { value: number; isPositive: boolean };
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {trend && (
        <div className={`text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'} flex items-center gap-1 mt-1`}>
          <TrendingUp className="h-3 w-3" />
          {trend.value}% par rapport au mois dernier
        </div>
      )}
    </CardContent>
  </Card>
);

// Composant pour afficher un rendez-vous
const AppointmentCard = ({ appointment }: { appointment: any }) => (
  <div className="flex items-center space-x-4 rounded-lg border p-4">
    <Avatar>
      <AvatarImage src={appointment.clientId.profileImage} />
      <AvatarFallback>
        {appointment.clientId.firstName[0]}
        {appointment.clientId.lastName[0]}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-1">
      <p className="font-medium">
        {appointment.clientId.firstName} {appointment.clientId.lastName}
      </p>
      <p className="text-sm text-muted-foreground">
        {format(new Date(appointment.date), 'PPP à HH:mm', { locale: fr })}
      </p>
    </div>
    <Button variant="ghost" size="icon">
      <ArrowRight className="h-4 w-4" />
    </Button>
  </div>
);

// Composant pour afficher un nouveau client
const ClientCard = ({ client }: { client: any }) => (
  <div className="flex items-center space-x-4 rounded-lg border p-4">
    <Avatar>
      <AvatarImage src={client.profileImage} />
      <AvatarFallback>
        {client.firstName[0]}
        {client.lastName[0]}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-1">
      <p className="font-medium">
        {client.firstName} {client.lastName}
      </p>
      <p className="text-sm text-muted-foreground">
        Inscrit le {format(new Date(client.createdAt), 'PP', { locale: fr })}
      </p>
    </div>
    <Button variant="ghost" size="icon">
      <ArrowRight className="h-4 w-4" />
    </Button>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  // Récupération des statistiques
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardService.getStats()
  });

  // Récupération des données du graphique
  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['activityChart'],
    queryFn: () => dashboardService.getActivityChart()
  });

  if (isLoadingStats || isLoadingActivity) {
    return <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="h-[400px] lg:col-span-4" />
        <Skeleton className="h-[400px] lg:col-span-3" />
      </div>
    </div>;
  }

  return (
    <div className="space-y-4">
      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clients"
          value={dashboardStats?.stats.totalClients || 0}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Rendez-vous aujourd'hui"
          value={dashboardStats?.stats.totalAppointmentsToday || 0}
          icon={Calendar}
        />
        <StatCard
          title="Notifications"
          value={dashboardStats?.stats.unreadNotifications || 0}
          icon={Bell}
        />
        <StatCard
          title="Taux d'occupation"
          value={`${Math.round(dashboardStats?.stats.occupancyRate || 0)}%`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Graphique d'activité */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Activité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <XAxis
                    dataKey="_id"
                    tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => format(new Date(value), 'PP', { locale: fr })}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Carte avec les rendez-vous du jour */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Rendez-vous du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats?.todayAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                />
              ))}
              {dashboardStats?.todayAppointments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun rendez-vous aujourd'hui
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Nouveaux clients */}
        <Card>
          <CardHeader>
            <CardTitle>Nouveaux clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats?.newClients.map((client) => (
                <ClientCard
                  key={client._id}
                  client={client}
                />
              ))}
              {dashboardStats?.newClients.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun nouveau client cette semaine
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prochains rendez-vous */}
        <Card>
          <CardHeader>
            <CardTitle>Prochains rendez-vous</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats?.upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                />
              ))}
              {dashboardStats?.upcomingAppointments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun rendez-vous à venir
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;