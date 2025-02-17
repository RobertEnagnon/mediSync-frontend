import { Toaster } from "@/components/ui/toaster"; // Importation du composant Toaster pour les notifications
import { Toaster as Sonner } from "@/components/ui/sonner"; // Importation d'un autre composant de notification
import { TooltipProvider } from "@/components/ui/tooltip"; // Importation du fournisseur de tooltips
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Importation de la gestion des requêtes
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Importation des composants de routage
import { useAuth } from "@/hooks/useAuth"; // Importation du hook d'authentification
import Index from "./pages/Index"; // Importation de la page d'accueil
import Calendar from "./pages/Calendar"; // Importation de la page de calendrier
import Appointments from "./pages/Appointments"; // Importation de la page des rendez-vous
import Clients from "./pages/Clients"; // Importation de la page des clients
import ClientDetails from "./pages/ClientDetails"; // Importation de la page des détails du client
import Login from "./pages/Login"; // Importation de la page de connexion
import Register from "./pages/Register"; // Importation de la page d'inscription

const queryClient = new QueryClient(); // Création d'une instance de QueryClient

// Composant de protection des routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth(); // Vérifie si l'utilisateur est authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" />; // Redirige vers la page de connexion si non authentifié
  }
  return <>{children}</>; // Retourne les enfants si authentifié
};

// Déclaration du composant App
const App = () => (
  <QueryClientProvider client={queryClient}> {/* Fournit le client de requête à l'application */}
    <TooltipProvider> {/* Fournit le contexte pour les tooltips */}
      <Toaster /> {/* Affiche les notifications */}
      <Sonner /> {/* Affiche un autre type de notification */}
      <BrowserRouter> {/* Utilise le routeur pour la navigation */}
        <Routes> {/* Définit les routes de l'application */}
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} /> {/* Route pour la page de connexion */}
          <Route path="/register" element={<Register />} /> {/* Route pour la page d'inscription */}

          {/* Routes protégées */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} /> {/* Route pour la page d'accueil */}
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} /> {/* Route pour le calendrier */}
          <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} /> {/* Route pour les rendez-vous */}
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} /> {/* Route pour les clients */}
          <Route path="/clients/:id" element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} /> {/* Route pour les détails d'un client */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App; // Exportation du composant App