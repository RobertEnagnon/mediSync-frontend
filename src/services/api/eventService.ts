import { Event, RecurrencePattern, EventStatus } from "@/types/event";
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
    // console.log("crete events:")
    // console.dir(event)
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

  createRecurring: async (
    event: Omit<Event, 'id'>,
    recurrencePattern: RecurrencePattern
  ): Promise<Event[]> => {
    // console.log("createRecurring event:")
    // console.dir(event)
    // console.log("createRecurring recurrencePattern:")
    // console.dir(recurrencePattern)
    const response = await fetch(`${API_BASE_URL}/events/recurring`, {
      method: 'POST',
      headers: {
        ...headers,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
      },
      body: JSON.stringify({
        ...event,
        recurrencePattern,
      }),
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

  getTodayEvents: async (): Promise<Event[]> => {
    const response = await fetch(`${API_BASE_URL}/events/today`, {
      headers: {
        ...headers,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
      },
    });
    return handleResponse(response);
  },

  getUpcoming: async (days?: number): Promise<Event[]> => {
    const url = days
      ? `${API_BASE_URL}/events/upcoming?days=${days}`
      : `${API_BASE_URL}/events/upcoming`;

    const response = await fetch(url, {
      headers: {
        ...headers,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
      },
    });
    return handleResponse(response);
  },

  search: async (
    query: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      type?: string;
      status?: string;
    }
  ): Promise<Event[]> => {
    let url = `${API_BASE_URL}/events/search?query=${encodeURIComponent(query)}`;

    if (filters) {
      if (filters.startDate) {
        url += `&startDate=${filters.startDate.toISOString()}`;
      }
      if (filters.endDate) {
        url += `&endDate=${filters.endDate.toISOString()}`;
      }
      if (filters.type) {
        url += `&type=${encodeURIComponent(filters.type)}`;
      }
      if (filters.status) {
        url += `&status=${encodeURIComponent(filters.status)}`;
      }
    }

    const response = await fetch(url, {
      headers: {
        ...headers,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
      },
    });
    return handleResponse(response);
  },

  updateStatus: async (
    id: string,
    status: EventStatus
  ): Promise<Event> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}/status`, {
      method: 'PATCH',
      headers: {
        ...headers,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  getByDateRange: async (startDate: string, endDate: string): Promise<Event[]> => {
    const url = `${API_BASE_URL}/events/date-range?startDate=${startDate}&endDate=${endDate}`;

    const response = await fetch(url, {
      headers: {
        ...headers,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth-storage'))?.state?.token}`,
      },
    });
    return handleResponse(response);
  },


};