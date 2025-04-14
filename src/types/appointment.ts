
import { IClient } from './client';

export interface IAppointment {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  clientId: IClient;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDto {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  clientId: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export type AppointmentStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type AppointmentType = 'meeting' | 'training' | 'holiday' | 'other';




export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {}