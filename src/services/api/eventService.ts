import { Event } from "@/types/event"; // Assurez-vous que le type Event est défini dans vos types
import { API_BASE_URL, headers, handleResponse } from "./config";

export const EventService = {
  getAll: async (): Promise<Event[]> => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      headers: {
        ...headers,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
      },
    });
    return handleResponse(response);
  },

  getById: async (id: string): Promise<Event> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      headers: {
        ...headers,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
      },
    });
    return handleResponse(response);
  },

  create: async (event: Omit<Event, 'id'>): Promise<Event> => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        ...headers,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
      },
      body: JSON.stringify(event),
    });
    return handleResponse(response);
  },

  update: async (id: string, event: Partial<Event>): Promise<Event> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: {
        ...headers,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
      },
      body: JSON.stringify(event),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: {
        ...headers,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
      },
    });
    return handleResponse(response);
  },
};