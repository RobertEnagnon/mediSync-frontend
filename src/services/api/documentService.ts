import { API_BASE_URL, getAuthToken, handleResponse } from './config';

export interface IDocument {
  _id: string;
  title: string;
  type: 'medical' | 'prescription' | 'report' | 'invoice' | 'other';
  clientId: string;
  practitionerId: string;
  filePath: string;
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateDocumentDto = Omit<IDocument, '_id' | 'createdAt' | 'updatedAt' | 'filePath'> & {
  file: File;
};

export type UpdateDocumentDto = Partial<Omit<IDocument, '_id' | 'createdAt' | 'updatedAt' | 'filePath'>> & {
  file?: File;
};

/**
 * Service pour la gestion des documents
 */
class DocumentService {
  private getHeaders(includeContentType: boolean = true) {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  /**
   * Récupère tous les documents
   */
  async getAll(): Promise<IDocument[]> {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Récupère un document par son ID
   */
  async getById(id: string): Promise<IDocument> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Récupère les documents d'un client
   */
  async getByClientId(clientId: string): Promise<IDocument[]> {
    const response = await fetch(`${API_BASE_URL}/documents/client/${clientId}`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Crée un nouveau document
   */
  async create(document: CreateDocumentDto): Promise<IDocument> {
    try {
      const formData = new FormData();
      formData.append('file', document.file);
      
      // Vérification des champs requis
      if (!document.title || !document.type || !document.clientId || !document.practitionerId) {
        throw new Error('Champs obligatoires manquants');
      }

      const documentData = {
        title: document.title,
        type: document.type,
        clientId: document.clientId,
        practitionerId: document.practitionerId,
        description: document.description || '',
        tags: document.tags || []
      };

      // Important : le backend s'attend à recevoir les données dans un champ 'data'
      formData.append('data', JSON.stringify(documentData));

      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur de création du document:', errorData);
        throw new Error(errorData.error || 'Erreur lors du téléchargement du document');
      }

      return handleResponse(response);
    } catch (error: any) {
      console.error('Erreur lors de la création du document:', error);
      throw error;
    }
  }

  /**
   * Met à jour un document
   */
  async update(id: string, document: UpdateDocumentDto): Promise<IDocument> {
    const formData = new FormData();
    if (document.file) {
      formData.append('file', document.file);
    }
    
    const data: any = {};
    if (document.title) data.title = document.title;
    if (document.type) data.type = document.type;
    if (document.description) data.description = document.description;
    if (document.tags) data.tags = document.tags;

    formData.append('data', JSON.stringify(data));

    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData
    });
    return handleResponse(response);
  }

  /**
   * Supprime un document
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Recherche des documents
   */
  async search(query: string): Promise<IDocument[]> {
    const response = await fetch(`${API_BASE_URL}/documents/search?q=${encodeURIComponent(query)}`, {
      headers: this.getHeaders()
    });
    return handleResponse(response);
  }

  /**
   * Télécharge un document
   */
  async download(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement du document');
    }
    return response.blob();
  }
}

export const documentService = new DocumentService();
