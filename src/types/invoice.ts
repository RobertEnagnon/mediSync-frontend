import { IClient } from './client';
import { IAppointment } from './appointment';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface IInvoice {
  id: string;
  invoiceNumber: string;
  clientId: string | IClient;
  appointmentId: string | IAppointment;
  items: IInvoiceItem[];
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateInvoiceDto {
  clientId: string;
  appointmentId: string;
  items: IInvoiceItem[];
}

export interface IUpdateInvoiceDto {
  items?: IInvoiceItem[];
  status?: 'pending' | 'paid' | 'cancelled';
}
