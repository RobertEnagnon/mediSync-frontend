import { Appointment, Client } from "@/types";

// Fonction helper pour générer des IDs uniques
const generateId = () => Math.random().toString(36).substr(2, 9);

// Service pour les clients
export const clientService = {
  getAll: (): Client[] => {
    const clients = localStorage.getItem('clients');
    return clients ? JSON.parse(clients) : [];
  },

  getById: (id: string): Client | undefined => {
    const clients = clientService.getAll();
    return clients.find(client => client.id === id);
  },

  create: (client: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient = {
      ...client,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const clients = clientService.getAll();
    localStorage.setItem('clients', JSON.stringify([...clients, newClient]));
    return newClient;
  },

  update: (id: string, client: Partial<Client>): Client => {
    const clients = clientService.getAll();
    const updatedClients = clients.map(c => 
      c.id === id ? { ...c, ...client } : c
    );
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    return updatedClients.find(c => c.id === id)!;
  },

  delete: (id: string): void => {
    const clients = clientService.getAll();
    localStorage.setItem('clients', JSON.stringify(clients.filter(c => c.id !== id)));
  },

  search: (query: string): Client[] => {
    const clients = clientService.getAll();
    const lowercaseQuery = query.toLowerCase();
    return clients.filter(client => 
      client.name.toLowerCase().includes(lowercaseQuery) ||
      client.email.toLowerCase().includes(lowercaseQuery) ||
      client.phone.toLowerCase().includes(lowercaseQuery)
    );
  }
};

// Service pour les rendez-vous
export const appointmentService = {
  getAll: (): Appointment[] => {
    const appointments = localStorage.getItem('appointments');
    return appointments ? JSON.parse(appointments) : [];
  },

  getById: (id: string): Appointment | undefined => {
    const appointments = appointmentService.getAll();
    return appointments.find(apt => apt.id === id);
  },

  create: (appointment: Omit<Appointment, 'id'>): Appointment => {
    const newAppointment = {
      ...appointment,
      id: generateId(),
    };
    const appointments = appointmentService.getAll();
    localStorage.setItem('appointments', JSON.stringify([...appointments, newAppointment]));
    return newAppointment;
  },

  update: (id: string, appointment: Partial<Appointment>): Appointment => {
    const appointments = appointmentService.getAll();
    const updatedAppointments = appointments.map(a => 
      a.id === id ? { ...a, ...appointment } : a
    );
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    return updatedAppointments.find(a => a.id === id)!;
  },

  delete: (id: string): void => {
    const appointments = appointmentService.getAll();
    localStorage.setItem('appointments', JSON.stringify(appointments.filter(a => a.id !== id)));
  },

  search: (query: string): Appointment[] => {
    const appointments = appointmentService.getAll();
    const lowercaseQuery = query.toLowerCase();
    return appointments.filter(apt => 
      apt.title.toLowerCase().includes(lowercaseQuery) ||
      apt.notes?.toLowerCase().includes(lowercaseQuery)
    );
  },

  filter: (filters: {
    status?: Appointment['status'];
    date?: string;
    clientId?: string;
  }): Appointment[] => {
    let appointments = appointmentService.getAll();
    
    if (filters.status) {
      appointments = appointments.filter(apt => apt.status === filters.status);
    }
    
    if (filters.date) {
      appointments = appointments.filter(apt => apt.date === filters.date);
    }
    
    if (filters.clientId) {
      appointments = appointments.filter(apt => apt.clientId === filters.clientId);
    }
    
    return appointments;
  }
};