
import { Appointment } from "@/types";
import { API_BASE_URL, headers, handleResponse } from "./config";

export const appointmentApiService = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/appointments`);
    return handleResponse(response);
  },

  getById: async (id: string): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`);
    return handleResponse(response);
  },

  create: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(appointment),
    });
    return handleResponse(response);
  },

  update: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(appointment),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response);
  },

  search: async (query: string): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/appointments/search?q=${query}`);
    return handleResponse(response);
  },

  filter: async (filters: {
    status?: Appointment['status'];
    date?: string;
    clientId?: string;
  }): Promise<Appointment[]> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    if (filters.clientId) params.append('clientId', filters.clientId);
    
    const response = await fetch(`${API_BASE_URL}/appointments/filter?${params}`);
    return handleResponse(response);
  }
};
