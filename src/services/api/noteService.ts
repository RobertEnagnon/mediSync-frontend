import { Note } from '@/types/note'; // Importer le type Note
import { API_BASE_URL, headers, handleResponse } from './config'; // Importer les configurations

export const NoteService = {
  token: JSON.parse(localStorage.getItem('auth-storage'))?.state?.token, // Récupérer le token d'authentification

  // Récupérer toutes les notes par ID de client
  getNotesByClientId: async (clientId: string): Promise<Note[]> => {
    const response = await fetch(`${API_BASE_URL}/notes/${clientId}`, {
      headers: {
        ...headers,
        Authorization: `Bearer ${NoteService.token}`, // Ajouter le token d'authentification
      },
    });
    return handleResponse(response); // Traiter la réponse
  },

  // Créer une nouvelle note
  createNote: async (note: Omit<Note, 'id'>): Promise<Note> => {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        ...headers,
        Authorization: `Bearer ${NoteService.token}`, // Ajouter le token d'authentification
      },
      body: JSON.stringify(note), // Convertir la note en JSON
    });
    return handleResponse(response); // Traiter la réponse
  },

  // Mettre à jour une note
  updateNote: async (id: string, note: Partial<Note>): Promise<Note> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        ...headers,
        Authorization: `Bearer ${NoteService.token}`, // Ajouter le token d'authentification
      },
      body: JSON.stringify(note), // Convertir la note en JSON
    });
    return handleResponse(response); // Traiter la réponse
  },

  // Supprimer une note
  deleteNote: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        ...headers,
        Authorization: `Bearer ${NoteService.token}`, // Ajouter le token d'authentification
      },
    });
    return handleResponse(response); // Traiter la réponse
  },
};

export default NoteService; // Exporter le service