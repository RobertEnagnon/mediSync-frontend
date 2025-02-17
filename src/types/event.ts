export interface Event {
  id: string; // Identifiant unique de l'événement
  title: string; // Titre de l'événement
  time: string; // Heure de l'événement
  duration: string; // Durée de l'événement
  type: string; // Type de l'événement (ex: Rendez-vous, Suivi)
}