import { IAppointment } from './appointment';
import { IClient } from './client';

export interface DashboardStats {
  todayAppointments: IAppointment[];
  upcomingAppointments: IAppointment[];
  newClients: IClient[];
  stats: {
    totalClients: number;
    totalAppointments: number;
    totalAppointmentsToday: number;
    unreadNotifications: number;
    occupancyRate: number;
    recentCancellations: number;
  };
}

export interface ActivityChartData {
  _id: string; // Date au format YYYY-MM-DD
  count: number;
}
