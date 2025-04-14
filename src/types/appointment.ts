
import { IClient } from './client';

export interface IAppointment {
  id: string;
  title: string;
  description?: string;
  date?: Date | string;
  duration?: number;
  notes?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  clientId: IClient;
  type?: AppointmentType;
  status?: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDto {
  title: string;
  description?: string;
  date?: Date | string;
  startTime?: string;
  endTime?: string;
  location?: string;
  duration?: number;
  notes?: string;
  clientId: string;
  type?: AppointmentType;
  status: AppointmentStatus;
}

// export type AppointmentStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type AppointmentStatus = 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
// export type AppointmentType = 'meeting' | 'training' | 'holiday' | 'other';
export type AppointmentType = 'consultation' | 'follow-up' | 'emergency' | 'other';;




export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {}