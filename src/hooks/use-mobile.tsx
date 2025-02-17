import * as React from "react"; // Importation de React

const MOBILE_BREAKPOINT = 768; // Définition du point de rupture pour les appareils mobiles

// Déclaration du hook useIsMobile
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined); // État pour déterminer si l'appareil est mobile

  // Effet pour détecter la taille de l'écran
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`); // Création d'une requête média
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); // Met à jour l'état en fonction de la largeur de l'écran
    };
    mql.addEventListener("change", onChange); // Ajoute un écouteur d'événements pour le changement de taille
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); // Définit l'état initial
    return () => mql.removeEventListener("change", onChange); // Nettoyage de l'écouteur d'événements
  }, []); // Dépendances vides pour exécuter l'effet une seule fois

  return !!isMobile; // Retourne true si l'appareil est mobile, sinon false
}