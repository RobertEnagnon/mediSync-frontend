import { API_BASE_URL } from './config';
import { getAuthToken } from './config';
import { handleResponse } from './config';

export type AppointmentStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type AppointmentType = 'meeting' | 'training' | 'holiday' | 'other';

export interface IAppointment {
  _id: string;
  title: string;
  description?: string;
  clientId: string;
  startDate: string;
  endDate: string;
  location?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateAppointmentDto = Omit<IAppointment, '_id' | 'createdAt' | 'updatedAt' | 'status'>;
export type UpdateAppointmentDto = Partial<CreateAppointmentDto>;

/**
 * Service pour la gestion des rendez-vous
 */
class AppointmentService {
  private getHeaders() {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Récupère tous les rendez-vous
   */
  async getAll(): Promise<IAppointment[]> {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des rendez-vous');
    }

    return response.json();
  }

  /**
   * Récupère un rendez-vous par son ID
   */
  async getById(id: string): Promise<IAppointment> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du rendez-vous');
    }

    return response.json();
  }

  /**
   * Récupère les rendez-vous d'un client
   */
  async getByClientId(clientId: string): Promise<IAppointment[]> {
    const response = await fetch(`${API_BASE_URL}/appointments/client/${clientId}`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Crée un nouveau rendez-vous
   */
  async create(appointment: CreateAppointmentDto): Promise<IAppointment> {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(appointment)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création du rendez-vous');
    }

    return response.json();
  }

  /**
   * Met à jour un rendez-vous
   */
  async update(id: string, appointment: Partial<IAppointment>): Promise<IAppointment> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(appointment)
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du rendez-vous');
    }

    return response.json();
  }

  /**
   * Supprime un rendez-vous
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du rendez-vous');
    }
  }

  /**
   * Récupère les rendez-vous par plage de dates
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<IAppointment[]> {
    const response = await fetch(
      `${API_BASE_URL}/appointments/date-range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        headers: this.getHeaders()
      }
    );
    return handleResponse(response);
  }

  /**
   * Récupère les rendez-vous à venir
   */
  async getUpcoming(): Promise<IAppointment[]> {
    const response = await fetch(`${API_BASE_URL}/appointments/upcoming`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Change le statut d'un rendez-vous
   */
  async updateStatus(id: string, status: IAppointment['status']): Promise<IAppointment> {
    return this.update(id, { status });
  }

  /**
   * Récupère les statistiques des rendez-vous
   */
  async getStatistics(): Promise<{
    total: number;
    completed: number;
    cancelled: number;
    upcoming: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/appointments/statistics`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Récupère les rendez-vous par plage de dates
   */
  async search(query: string): Promise<IAppointment[]> {
    const response = await fetch(`${API_BASE_URL}/appointments/search?q=${query}`,{
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Récupère les rendez-vous par filtres
   */
  async filter(filters: {
    status?: IAppointment['status'];
    date?: string;
    clientId?: string;
    practitionerId?: string;
  }): Promise<IAppointment[]> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.practitionerId) params.append('practitionerId', filters.practitionerId);
    
    const response = await fetch(`${API_BASE_URL}/appointments/filter?${params}`,{
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Récupère l'historique des rendez-vous
   */
  async getHistory(): Promise<IAppointment[]> {
    const response = await fetch(`${API_BASE_URL}/appointments/history`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }
}

export const appointmentService = new AppointmentService();
