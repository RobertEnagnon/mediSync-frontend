
export const API_BASE_URL = 'http://localhost:5000/api';

export const headers = {
  'Content-Type': 'application/json',
};

export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Une erreur est survenue');
  }
  return response.json();
};
