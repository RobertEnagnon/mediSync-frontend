import { INote } from '@/types/note'; // Importer le type Note
import { API_BASE_URL, headers, handleResponse } from './config'; // Importer les configurations

export class NoteService  {
 private token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token; // Récupérer le token d'authentification

 constructor() {
}
  // Récupérer toutes les notes par ID de client
 async getNotesByClientId (clientId: string): Promise<INote[]>  {
    const response = await fetch(`${API_BASE_URL}/notes/${clientId}`, {
      headers: {
        ...headers,
        Authorization: `Bearer ${this.token}`, // Ajouter le token d'authentification
      },
    });
    return handleResponse(response); // Traiter la réponse
  }

  // Créer une nouvelle note
  async createNote (note: Omit<INote, 'id'>): Promise<INote>{
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        ...headers,
        Authorization: `Bearer ${this.token}`, // Ajouter le token d'authentification
      },
      body: JSON.stringify(note), // Convertir la note en JSON
    });
    return handleResponse(response); // Traiter la réponse
  }

  // Mettre à jour une note
  async updateNote (id: string, note: Partial<INote>): Promise<INote>{
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        ...headers,
        Authorization: `Bearer ${this.token}`, // Ajouter le token d'authentification
      },
      body: JSON.stringify(note), // Convertir la note en JSON
    });
    return handleResponse(response); // Traiter la réponse
  }

  // Supprimer une note
  async deleteNote (id: string): Promise<void>  {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        ...headers,
        Authorization: `Bearer ${this.token}`, // Ajouter le token d'authentification
      },
    });
    return handleResponse(response); // Traiter la réponse
  }
};

export const noteService = new NoteService(); // Exporter le service