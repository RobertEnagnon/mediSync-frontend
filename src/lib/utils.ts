import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Déclaration de fonctions utilitaires

// Fonction pour formater une date
export const formatDate = (date: Date) => {
  return date.toLocaleDateString("fr-FR", {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }); // Retourne la date formatée en français
};

// Fonction pour générer un identifiant unique
export const generateId = () => {
  return '_' + Math.random().toString(36).substr(2, 9); // Génère un identifiant unique
};
