/**
 * Interface représentant un client dans l'application
 */
export interface IClient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  address?: string;
  notes?: string;
  isArchived: boolean;
  practitionerId: string;
  createdAt: string;
  updatedAt: string;
  lastVisit?: string;
}

/**
 * Type pour la création d'un nouveau client
 */
export type CreateClientDto = Omit<IClient, '_id' | 'createdAt' | 'updatedAt' | 'practitionerId'>;

/**
 * Type pour la mise à jour d'un client
 */
export type UpdateClientDto = Partial<CreateClientDto>;

/**
 * Interface pour les statistiques des clients
 */
export interface IClientStatistics {
  total: number;
  newThisMonth: number;
  birthdays: number;
  appointments: {
    upcoming: number;
    total: number;
  };
}

/**
 * Interface pour les filtres des clients
 */
export interface IClientFilters {
  search?: string;
  isArchived?: boolean;
  hasUpcomingAppointments?: boolean;
  hasBirthday?: boolean;
  sortBy?: 'name' | 'createdAt' | 'lastVisit';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
