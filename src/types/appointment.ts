// frontend/src/types/appointment.ts
export interface IAppointment {
    _id: string;
    title: string;
    clientId: string;
    practitionerId: string;
    date: Date;
    duration: number;
    type: AppointmentType;
    status: AppointmentStatus;
    notes?: string;
    cancelledAt?: Date;
    cancellationReason?: string;
    confirmedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type AppointmentStatus = 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  export type AppointmentType = 'consultation' | 'follow-up' | 'emergency' | 'other';