/**
 * Interface représentant un client dans l'application
 */
export interface IClient {
  _id: string;
  firstName: string;
  lastName: string;
  practitionerId?: string,
  email: string;
  phone: string;
  birthDate?: Date;
  address?: string;
  notes?: string;
  createdAt: Date;
  lastVisit?: Date;
  isArchived?: boolean;
  archivedAt?: Date;
  // Champ virtuel généré par le backend
  name?: string;
}

/**
 * Type pour la création d'un nouveau client
 */
export type CreateClientDto = Omit<IClient, '_id' | 'createdAt' | 'lastVisit' | 'isArchived' | 'archivedAt'>;

/**
 * Type pour la mise à jour d'un client
 */
export type UpdateClientDto = Partial<CreateClientDto>;

/**
 * Interface pour les statistiques des clients
 */
export interface IClientStatistics {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  averageVisitsPerMonth: number;
}
