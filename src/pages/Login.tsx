import React from 'react'; // Importation de React
import { useState } from "react"; // Importation de useState pour gérer l'état local
import { useNavigate } from "react-router-dom"; // Importation de useNavigate pour la navigation
import { useToast } from "@/hooks/use-toast"; // Importation du hook pour afficher des notifications
import { Button } from "@/components/ui/button"; // Importation du composant Button
import { Input } from "@/components/ui/input"; // Importation du composant Input
import { Label } from "@/components/ui/label"; // Importation du composant Label
import { Card } from "@/components/ui/card"; // Importation du composant Card
import { useAuth } from "@/hooks/useAuth"; // Importation du hook d'authentification
import { Link } from "react-router-dom"; // Importation de Link pour la navigation
import { Eye, EyeOff } from 'lucide-react';

// Déclaration du composant Login
const Login = () => {
  const [email, setEmail] = useState(""); // État pour l'email
  const [password, setPassword] = useState(""); // État pour le mot de passe
  const [isLoading, setIsLoading] = useState(false); // État pour gérer le chargement
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Hook pour la navigation
  const { toast } = useToast(); // Hook pour afficher des notifications
  const { login } = useAuth(); // Fonction de connexion du hook d'authentification

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setIsLoading(true); // Indique que le chargement a commencé

    try {
      await login(email, password); // Appelle la fonction de connexion
      toast({
        title: "Connexion réussie", // Notification de succès
        description: "Vous êtes maintenant connecté",
      });
      navigate("/"); // Redirige vers la page d'accueil
    } catch (error) {
      toast({
        title: "Erreur de connexion", // Notification d'erreur
        description: "Email ou mot de passe incorrect",
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
            Connexion
          </h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Met à jour l'état lors du changement
              required
              className="mt-1"
              placeholder="exemple@email.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Met à jour l'état lors du changement
                required
                className="mt-1"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
              Mot de passe oublié ? {/* Lien vers la page de réinitialisation du mot de passe */}
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Connexion en cours..." : "Se connecter"} {/* Affiche le texte en fonction de l'état de chargement */}
          </Button>
          <p className="text-center text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-500">
              S'inscrire
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Login; // Exportation du composant Login