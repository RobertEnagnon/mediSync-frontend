export interface Appointment {
  _id: string;
  title: string;
  date: string;
  time: string;
  clientId: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: string;
  lastVisit?: string;
}