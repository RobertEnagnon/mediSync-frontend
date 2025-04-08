// frontend/src/types/appointment.ts
export type AppointmentType = 'consultation' | 'follow-up' | 'emergency' | 'other';

export type AppointmentStatus = 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

export interface IAppointment {
  _id: string;
  title: string;
  description?: string;
  date: string;
  duration: number;
  clientId: string;
  practitionerId: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  confirmedAt?: string;
  completedAt?: string;
}

export type CreateAppointmentDto = Omit<IAppointment, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'cancelledAt' | 'cancellationReason' | 'confirmedAt' | 'completedAt'>;
export type UpdateAppointmentDto = Partial<CreateAppointmentDto>;