
import { Client } from "@/types";
import { API_BASE_URL, headers, handleResponse } from "./config";
import { Note } from "@/types/note";

export const ClientService = {
  token: JSON.parse(localStorage.getItem('auth-storage'))?.state?.token,

  getAll: async (): Promise<Client[]> => {

    const response = await fetch(`${API_BASE_URL}/clients`, {
      headers: {
        ...headers,
        Authorization: `Bearer ${ClientService.token}`,
      },
    });
    return handleResponse(response);
  },

  getById: async (id: string): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      headers: {
        ...headers,
        Authorization: `Bearer ${ClientService.token}`,
      },
    });
    return handleResponse(response);
  },

  create: async (client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: {
        ...headers,
        Authorization: `Bearer ${ClientService.token}`,
      },
      body: JSON.stringify(client),
    });
    return handleResponse(response);
  },

  update: async (id: string, client: Partial<Client>): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: {
        ...headers,
        Authorization: `Bearer ${ClientService.token}`,
      },
      body: JSON.stringify(client),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
      headers: {
        ...headers,
        Authorization: `Bearer ${ClientService.token}`,
      },
    });
    return handleResponse(response);
  },

  search: async (query: string): Promise<Client[]> => {
    const response = await fetch(`${API_BASE_URL}/clients/search?q=${query}`,{
      headers: {
        ...headers,
        Authorization: `Bearer ${ClientService.token}`,
      },
    });
    return handleResponse(response);
  },

  getNotesById: async (clientId: string): Promise<Note[]> => {
    const response = await fetch(`${API_BASE_URL}/notes/${clientId}`, {
      headers: {
        ...headers,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
      },
    });
    return handleResponse(response);
  },
};
