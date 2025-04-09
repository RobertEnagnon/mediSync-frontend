export type EventType = 'appointment' | 'meeting' | 'break' | 'holiday' | 'other';
export type EventStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number;
  endDate: Date;
  daysOfWeek?: number[];
}

export interface Reminder {
  enabled: boolean;
  timing: number; // minutes before event
}

export interface Event {
  id?: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // en minutes
  type: EventType;
  status: EventStatus;
  color?: string;
  location?: string;
  participants?: string[];
  practitionerId: string;
  createdAt?: Date;
  updatedAt?: Date;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  reminder?: Reminder;
  notes?: string;
}