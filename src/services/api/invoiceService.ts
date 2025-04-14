import { API_BASE_URL, headers, handleResponse, getAuthToken } from './config';
import { IInvoice, IInvoiceItem, ICreateInvoiceDto, IUpdateInvoiceDto } from '../../types/invoice';

export type { IInvoice, IInvoiceItem, ICreateInvoiceDto, IUpdateInvoiceDto };

/**
 * Service pour la gestion des factures
 */
class InvoiceService {
  private getHeaders() {
    const token = getAuthToken();
    return {
      ...headers,
      Authorization: `Bearer ${token}`
    };
  }

  /**
   * Récupère toutes les factures
   */
  async getAll(): Promise<IInvoice[]> {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Récupère une facture par son ID
   */
  async getById(id: string): Promise<IInvoice> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Récupère les factures d'un client
   */
  async getByClientId(clientId: string): Promise<IInvoice[]> {
    const response = await fetch(`${API_BASE_URL}/clients/${clientId}/invoices`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Crée une nouvelle facture
   */
  async create(data: ICreateInvoiceDto): Promise<IInvoice> {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }

  /**
   * Met à jour une facture
   */
  async update(id: string, data: IUpdateInvoiceDto): Promise<IInvoice> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }

  /**
   * Supprime une facture
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Télécharge une facture au format PDF
   */
  async downloadPdf(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/pdf`, {
      headers: this.getHeaders()
    });
    return response.blob();
  }

  /**
   * Marque une facture comme payée
   */
  async markAsPaid(id: string, paymentMethod: string): Promise<IInvoice> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/pay`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ paymentMethod })
    });
    return handleResponse(response);
  }

  /**
   * Annule une facture
   */
  async cancel(id: string, reason?: string): Promise<IInvoice> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/cancel`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason })
    });
    return handleResponse(response);
  }
}

export const invoiceService = new InvoiceService();
