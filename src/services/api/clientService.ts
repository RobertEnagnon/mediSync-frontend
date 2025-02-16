
import { Client } from "@/types";
import { API_BASE_URL, headers, handleResponse } from "./config";

export const clientApiService = {
  getAll: async (): Promise<Client[]> => {
    const response = await fetch(`${API_BASE_URL}/clients`);
    return handleResponse(response);
  },

  getById: async (id: string): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`);
    return handleResponse(response);
  },

  create: async (client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers,
      body: JSON.stringify(client),
    });
    return handleResponse(response);
  },

  update: async (id: string, client: Partial<Client>): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(client),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response);
  },

  search: async (query: string): Promise<Client[]> => {
    const response = await fetch(`${API_BASE_URL}/clients/search?q=${query}`);
    return handleResponse(response);
  }
};
