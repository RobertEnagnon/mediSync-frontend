import { API_BASE_URL, headers, handleResponse, getAuthToken } from './config';
import { DashboardStats, ActivityChartData } from '@/types/dashboard';

/**
 * Service pour gérer les fonctionnalités du tableau de bord
 */
class DashboardService {
  private getHeaders() {
    const token = getAuthToken();
    return {
      ...headers,
      Authorization: `Bearer ${token}`
    };
  }

  /**
   * Récupère toutes les statistiques du tableau de bord
   */
  async getStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Récupère les données pour le graphique d'activité
   */
  async getActivityChart(): Promise<ActivityChartData[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/activity-chart`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }
}

export const dashboardService = new DashboardService();
