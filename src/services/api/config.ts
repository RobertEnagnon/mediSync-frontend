/**
 * URL de base de l'API
 */
export const API_BASE_URL = 'http://localhost:5000/api';

/**
 * En-têtes par défaut pour les requêtes
 */
export const headers = {
  'Content-Type': 'application/json',
};

/**
 * Gestion de la réponse de l'API
 * @param response Réponse de l'API
 * @returns Données de la réponse
 * @throws Erreur avec message
 */
export const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Si la réponse contient un message d'erreur, on l'utilise
    if (data.message) {
      throw new Error(data.message);
    }
    // Sinon, on utilise le statut HTTP
    throw new Error(response.statusText || 'Une erreur est survenue');
  }

  return data;
};

/**
 * Récupère le token d'authentification depuis le stockage local
 */
export const getAuthToken = (): string | null => {
  const authStorage = localStorage.getItem('auth-storage');
  if (!authStorage) return null;

  try {
    const { state } = JSON.parse(authStorage);
    // console.log(state);
    return state?.token || null;
  } catch {
    return null;
  }
};
