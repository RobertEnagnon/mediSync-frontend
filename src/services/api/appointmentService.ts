import { API_BASE_URL, getAuthToken } from './config';
import { parseISO, isValid, differenceInMinutes } from 'date-fns';
import { IClient } from '../../types/client';

interface IAppointment {

   id: string;
    title: string;
    description?: string;
    date?: Date | string;
    duration?: number;
    notes?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    clientId: string;
    practitionerId: string;
    type?: AppointmentType;
    status?: AppointmentStatus;
    createdAt: string;
    updatedAt: string;
}

interface CreateAppointmentDto {

   title: string;
    description?: string;
    date?: Date | string;
    startTime?: string;
    endTime?: string;
    location?: string;
    duration?: number;
    notes?: string;
    clientId: string;
    practitionerId: string;
    type?: AppointmentType;
    status: AppointmentStatus;
}

interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {}


// export type AppointmentStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type AppointmentStatus = 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
// export type AppointmentType = 'meeting' | 'training' | 'holiday' | 'other';
export type AppointmentType = 'consultation' | 'follow-up' | 'emergency' | 'other';




/**
 * Service pour la gestion des rendez-vous
 */
class AppointmentService {
  private async getHeaders() {
    return {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    };
  }

  private validateAndFormatDate(dateString: string | undefined | null): string {
    if (!dateString) {
      const now = new Date();
      return now.toISOString();
    }

    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        console.error('Date invalide reçue:', dateString);
        const now = new Date();
        return now.toISOString();
      }
      return date.toISOString();
    } catch (error) {
      console.error('Erreur de validation de la date:', dateString, error);
      const now = new Date();
      return now.toISOString();
    }
  }

  private formatAppointmentForAPI(appointment: Partial<IAppointment>) {
    const startTime = this.validateAndFormatDate(appointment.startTime);
    const endTime = this.validateAndFormatDate(appointment.endTime);
    
    return {
      title: appointment.title || 'Sans titre',
      // date: startTime,
      date: appointment.date,
      // duration: differenceInMinutes(new Date(endTime), new Date(startTime)),
      duration: appointment.duration,
      clientId: appointment.clientId || '0',
      practitionerId: appointment.practitionerId || '0',
      type: appointment.type || 'meeting',
      status: appointment.status || 'scheduled',
      description: appointment.description,
      notes: appointment.notes,
      location: appointment.location
    };
  }

  /**
   * Récupère tous les rendez-vous
   */
  async getAll(): Promise<IAppointment[]> {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      headers: await this.getHeaders()
    });
    const data = await this.handleResponse<any[]>(response);
    return data.map(appointment => {
      if (!appointment || typeof appointment !== 'object') {
        console.error('Rendez-vous invalide reçu:', appointment);
        return null;
      }

      try {
        const startTime = this.validateAndFormatDate(appointment.date);
        const endTime = new Date(new Date(startTime).getTime() + (appointment.duration || 30) * 60000).toISOString();

        return {
          id: appointment._id || appointment.id || crypto.randomUUID(),
          title: appointment.title || 'Sans titre',
          description: appointment.description,
          clientId: appointment.clientId || '0',
          practitionerId: appointment.practitionerId || '0',
          startTime,
          endTime,
          location: appointment.location,
          type: appointment.type || 'meeting',
          status: appointment.status || 'scheduled',
          notes: appointment.notes,
          date: appointment.date,
          duration: appointment.duration,
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
        };
      } catch (error) {
        console.error('Erreur lors du traitement du rendez-vous:', error);
        return null;
      }
    }).filter(Boolean) as IAppointment[];
  }

  /**
   * Récupère un rendez-vous par son ID
   */
  async getById(id: string): Promise<IAppointment> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      headers: await this.getHeaders()
    });
    const data = await this.handleResponse<any>(response);
    const startTime = this.validateAndFormatDate(data.date);
    const endTime = new Date(new Date(startTime).getTime() + (data.duration || 30) * 60000).toISOString();

    return {
      id: data.id || data._id,
      title: data.title || 'Sans titre',
      description: data.description,
      clientId: data.clientId || '0',
      practitionerId: data.practitionerId || '0',
      startTime,
      endTime,
      location: data.location,
      type: data.type || 'meeting',
      status: data.status || 'scheduled',
      notes: data.notes,
      date: data.date,
      duration: data.duration,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * Crée un nouveau rendez-vous
   */
  async create(appointment: CreateAppointmentDto): Promise<IAppointment> {
    const appointmentData = this.formatAppointmentForAPI(appointment);
    
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(appointmentData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Erreur de création:', error);
      throw new Error(error.message || 'Erreur lors de la création du rendez-vous');
    }

    return this.handleResponse(response);
  }

  /**
   * Met à jour un rendez-vous
   */
  async update(id: string, appointment: UpdateAppointmentDto): Promise<IAppointment> {
    // Récupérer d'abord le rendez-vous existant
    const existingAppointment = await this.getById(id);
    
    // Fusionner les données existantes avec les mises à jour
    const updatedAppointment = {
      ...existingAppointment,
      ...appointment
    };

    // Formater les données pour l'API
    const appointmentData = this.formatAppointmentForAPI(updatedAppointment);

    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: JSON.stringify(appointmentData)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erreur de mise à jour:', error);
      throw new Error(error.message || 'Erreur lors de la mise à jour du rendez-vous');
    }

    return this.handleResponse(response);
  }

  /**
   * Supprime un rendez-vous
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: await this.getHeaders()
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
        headers: await this.getHeaders()
      }
    );
    const data = await this.handleResponse<any[]>(response);
    return data.map(appointment => ({
      ...appointment,
      startTime: this.validateAndFormatDate(appointment.date),
      endTime: new Date(new Date(appointment.date).getTime() + (appointment.duration || 30) * 60000).toISOString(),
    }));
  }

  /**
   * Récupère les rendez-vous à venir
   */
  async getUpcoming(): Promise<IAppointment[]> {
    const response = await fetch(`${API_BASE_URL}/appointments/upcoming`, {
      headers: await this.getHeaders()
    });
    const data = await this.handleResponse<any[]>(response);
    return data.map(appointment => ({
      ...appointment,
      startTime: this.validateAndFormatDate(appointment.date),
      endTime: new Date(new Date(appointment.date).getTime() + (appointment.duration || 30) * 60000).toISOString(),
    }));
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
      headers: await this.getHeaders()
    });
    return this.handleResponse(response);
  }

  /**
   * Récupère les rendez-vous par plage de dates
   */
  async search(query: string): Promise<IAppointment[]> {
    const response = await fetch(`${API_BASE_URL}/appointments/search?q=${query}`,{
      headers: await this.getHeaders()
    });
    const data = await this.handleResponse<any[]>(response);
    return data.map(appointment => ({
      ...appointment,
      startTime: this.validateAndFormatDate(appointment.date),
      endTime: new Date(new Date(appointment.date).getTime() + (appointment.duration || 30) * 60000).toISOString(),
    }));
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
      headers: await this.getHeaders()
    });
    const data = await this.handleResponse<any[]>(response);
    return data.map(appointment => ({
      ...appointment,
      startTime: this.validateAndFormatDate(appointment.date),
      endTime: new Date(new Date(appointment.date).getTime() + (appointment.duration || 30) * 60000).toISOString(),
    }));
  }

  /**
   * Récupère l'historique des rendez-vous
   */
  async getHistory(): Promise<IAppointment[]> {
    const response = await fetch(`${API_BASE_URL}/appointments/history`, {
      headers: await this.getHeaders()
    });
    const data = await this.handleResponse<any[]>(response);
    return data.map(appointment => ({
      ...appointment,
      startTime: this.validateAndFormatDate(appointment.date),
      endTime: new Date(new Date(appointment.date).getTime() + (appointment.duration || 30) * 60000).toISOString(),
    }));
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Une erreur est survenue');
    }
    return response.json();
  }
}

export default new AppointmentService();
