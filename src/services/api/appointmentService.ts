
import { Appointment } from "@/types";
import { API_BASE_URL, headers, handleResponse } from "./config";

export const AppointmentService = {
  token: JSON.parse(localStorage.getItem('auth-storage'))?.state?.token,
  getAll: async (): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/appointments`,{
      headers: {
        ...headers,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
      },
    });
    return handleResponse(response);
  },

  getById: async (id: string): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`,{
      headers: {
        ...headers,
        Authorization: `Bearer ${AppointmentService.token}`,
      },
    });
    return handleResponse(response);
  },

  create: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        ...headers,
        Authorization: `Bearer ${AppointmentService.token}`,
      },
      body: JSON.stringify(appointment),
    });
    return handleResponse(response);
  },

  update: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: {
        ...headers,
        Authorization: `Bearer ${AppointmentService.token}`,
      },
      body: JSON.stringify(appointment),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        ...headers,
        Authorization: `Bearer ${AppointmentService.token}`,
      },
    });
    return handleResponse(response);
  },

  search: async (query: string): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/appointments/search?q=${query}`,{
      headers: {
        ...headers,
        Authorization: `Bearer ${AppointmentService.token}`,
      },
    });
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
    
    const response = await fetch(`${API_BASE_URL}/appointments/filter?${params}`,{
      headers: {
        ...headers,
        Authorization: `Bearer ${AppointmentService.token}`,
      },
    });
    return handleResponse(response);
  }
};
