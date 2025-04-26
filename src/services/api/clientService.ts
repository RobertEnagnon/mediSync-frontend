import { IClient, CreateClientDto, UpdateClientDto, IClientStatistics } from '../../types/client';
import { API_BASE_URL, headers, handleResponse, getAuthToken } from './config';

/**
 * Service pour la gestion des clients
 */
class ClientService {
  private token: string;

  constructor() {
    const authStorage = localStorage.getItem('auth-storage');
    this.token = authStorage ? JSON.parse(authStorage)?.state?.token : '';
  }

  private getHeaders() {
    return {
      ...headers,
      Authorization: `Bearer ${this.token}`,
    };
  }

  /**
   * Récupère tous les clients
   */
  async getAll(): Promise<IClient[]> {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des clients');
    }
    return response.json();
  }

  /**
   * Récupère un client par son ID
   */
  async getById(id: string): Promise<IClient> {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du client');
    }
    return response.json();
  }

  /**
   * Crée un nouveau client
   */
  async create(client: CreateClientDto): Promise<IClient> {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(client),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la création du client');
    }
    return response.json();
  }

  /**
   * Met à jour un client existant
   */
  async update(id: string, client: UpdateClientDto): Promise<IClient> {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(client),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du client');
    }
    return response.json();
  }

  /**
   * Supprime un client
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du client');
    }
  }

  /**
   * Recherche des clients
   */
  async search(query: string): Promise<IClient[]> {
    const response = await fetch(`${API_BASE_URL}/clients/search?query=${encodeURIComponent(query)}`, {
      headers: this.getHeaders(),
    });
    return handleResponse(response);
  }

  /**
   * Récupère les clients par plage de dates
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<IClient[]> {
    const response = await fetch(
      `${API_BASE_URL}/clients/date-range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        headers: this.getHeaders(),
      }
    );
    return handleResponse(response);
  }

  /**
   * Récupère les clients dont c'est bientôt l'anniversaire
   */
  async getUpcomingBirthdays(daysInAdvance: number = 7): Promise<IClient[]> {
    const response = await fetch(
      `${API_BASE_URL}/clients/upcoming-birthdays?daysInAdvance=${daysInAdvance}`,
      {
        headers: this.getHeaders(),
      }
    );
    console.log(response)
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des anniversaires à venir');
    }
    return response.json();
  }

  /**
   * Récupère les clients inactifs
   */
  async getInactiveClients(inactiveDate: Date): Promise<IClient[]> {
    const response = await fetch(
      `${API_BASE_URL}/clients/inactive?inactiveDate=${inactiveDate.toISOString()}`,
      {
        headers: this.getHeaders(),
      }
    );
    return handleResponse(response);
  }

  /**
   * Récupère les statistiques des clients
   */
  async getStatistics(): Promise<IClientStatistics> {
    const response = await fetch(`${API_BASE_URL}/clients/statistics`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    return response.json();
  }

  /**
   * Archive un client
   */
  async archive(id: string): Promise<IClient> {
    const response = await fetch(`${API_BASE_URL}/clients/${id}/archive`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    return handleResponse(response);
  }

  /**
   * Désarchive un client
   */
  async unarchive(id: string): Promise<IClient> {
    const response = await fetch(`${API_BASE_URL}/clients/${id}/unarchive`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    return handleResponse(response);
  }

  /**
   * Fusionne deux clients
   */
  async merge(sourceId: string, targetId: string): Promise<IClient> {
    const response = await fetch(`${API_BASE_URL}/clients/merge`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ sourceId, targetId }),
    });
    return handleResponse(response);
  }
}

export const clientService = new ClientService();
