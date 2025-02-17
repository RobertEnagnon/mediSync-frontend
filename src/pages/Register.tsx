import React from 'react'; // Importation de la bibliothèque React pour créer des composants
import { useState } from "react"; // Importation de useState pour gérer l'état local
import { useNavigate } from "react-router-dom"; // Importation de useNavigate pour la navigation
import { useToast } from "@/hooks/use-toast"; // Importation du hook pour afficher des notifications
import { Button } from "@/components/ui/button"; // Importation du composant Button
import { Input } from "@/components/ui/input"; // Importation du composant Input
import { Label } from "@/components/ui/label"; // Importation du composant Label
import { Card } from "@/components/ui/card"; // Importation du composant Card
import { useAuth } from "@/hooks/useAuth"; // Importation du hook d'authentification
import { Link } from "react-router-dom"; // Importation de Link pour la navigation

// Déclaration du composant Register
const Register = () => {
  // État pour les données du formulaire
  const [formData, setFormData] = useState({
    firstName: "", // Prénom
    lastName: "", // Nom de famille
    email: "", // Adresse email
    password: "", // Mot de passe
  });
  const [isLoading, setIsLoading] = useState(false); // État pour gérer le chargement
  const navigate = useNavigate(); // Hook pour la navigation
  const { toast } = useToast(); // Hook pour afficher des notifications
  const { register } = useAuth(); // Fonction d'inscription du hook d'authentification

  // Fonction pour gérer les changements dans les champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value }); // Met à jour l'état avec la nouvelle valeur
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setIsLoading(true); // Indique que le chargement a commencé

    try {
      // Appelle la fonction d'inscription avec les données du formulaire
      await register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );
      toast({
        title: "Inscription réussie", // Notification de succès
        description: "Votre compte a été créé avec succès",
      });
      navigate("/"); // Redirige vers la page d'accueil
    } catch (error) {
      toast({
        title: "Erreur d'inscription", // Notification d'erreur
        description: "Une erreur est survenue lors de l'inscription",
        variant: "destructive", // Variante pour indiquer une erreur
      });
    } finally {
      setIsLoading(false); // Indique que le chargement est terminé
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Créer un compte
          </h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={handleChange} // Met à jour l'état lors du changement
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleChange} // Met à jour l'état lors du changement
                required
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange} // Met à jour l'état lors du changement
              required
              className="mt-1"
              placeholder="exemple@email.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange} // Met à jour l'état lors du changement
              required
              className="mt-1"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Inscription en cours..." : "S'inscrire"} {/* Affiche le texte en fonction de l'état de chargement */}
          </Button>
          <p className="text-center text-sm text-gray-600">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              Se connecter
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Register; // Exportation du composant Register