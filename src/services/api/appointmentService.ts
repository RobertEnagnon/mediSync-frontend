import { API_BASE_URL,getAuthToken,handleResponse } from './config';

export type AppointmentStatus = 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
export type AppointmentType = 'consultation' | 'follow-up' | 'emergency' | 'other';

export interface IAppointment {
  _id: string;
  title: string;
  clientId: string;
  practitionerId: string;
  date: Date;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  confirmedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateAppointmentDto = Omit<IAppointment, '_id' | 'createdAt' | 'updatedAt'>;
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
    return handleResponse(response);
  }

  /**
   * Récupère un rendez-vous par son ID
   */
  async getById(id: string): Promise<IAppointment> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
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
    return handleResponse(response);
  }

  /**
   * Met à jour un rendez-vous
   */
  async update(id: string, appointment: UpdateAppointmentDto): Promise<IAppointment> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(appointment)
    });
    return handleResponse(response);
  }

  /**
   * Supprime un rendez-vous
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return handleResponse(response);
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
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
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
}

export const appointmentService = new AppointmentService();
