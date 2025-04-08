import { Toaster } from "@/components/ui/toaster"; // Importation du composant Toaster pour les notifications
import { Toaster as Sonner } from "@/components/ui/sonner"; // Importation d'un autre composant de notification
import { TooltipProvider } from "@/components/ui/tooltip"; // Importation du fournisseur de tooltips
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Importation de la gestion des requêtes
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Importation des composants de routage
import { useAuth } from "@/hooks/useAuth"; // Importation du hook d'authentification
import { Layout } from "@/components/Layout"; // Importation du composant de layout

// Pages
import Index from "./pages/Index"; // Importation de la page d'accueil
import Calendar from "./pages/Calendar"; // Importation de la page de calendrier
import Appointments from "./pages/Appointments"; // Importation de la page des rendez-vous
import Clients from "./pages/Clients"; // Importation de la page des clients
import ClientDetails from "./pages/ClientDetails"; // Importation de la page des détails du client
import Login from "./pages/Login"; // Importation de la page de connexion
import Register from "./pages/Register"; // Importation de la page d'inscription
import Profile from "./pages/Profile"; // Importation de la page de profil
import Settings from "./pages/Settings"; // Importation de la page des paramètres
import AppointmentHistory from "./pages/AppointmentHistory"; // Importation de la page de l'historique des rendez-vous
import Notifications from "./pages/Notifications"; // Importation de la page des notifications
import Dashboard from "./pages/Dashboard"; // Importation de la page de tableau de bord
import ForgotPassword from "./pages/ForgotPassword"; // Importation de la page de mot de passe oublié
import ResetPassword from "./pages/ResetPassword"; // Importation de la page de réinitialisation de mot de passe
import VerifyEmail from "./pages/VerifyEmail"; // Importation de la page de vérification d'email
import RegistrationSuccess from "./pages/RegistrationSuccess"; // Importation de la page de succès d'inscription
import Invoices from "./pages/Invoices"; // Importation de la page des factures
import Documents from "./pages/Documents"; // Importation de la page des documents
import Events from "./pages/Events"; // Importation de la page des événements

const queryClient = new QueryClient(); // Création d'une instance de QueryClient

// Composant de protection des routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth(); // Vérifie si l'utilisateur est authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" />; // Redirige vers la page de connexion si non authentifié
  }
  return <Layout>{children}</Layout>; // Retourne les enfants si authentifié
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
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Route pour la page de mot de passe oublié */}
          <Route path="/reset-password" element={<ResetPassword />} /> {/* Route pour la page de réinitialisation de mot de passe */}
          <Route path="/verify-email" element={<VerifyEmail />} /> {/* Route pour la page de vérification d'email */}
          <Route path="/registration-success" element={<RegistrationSuccess />} /> {/* Route pour la page de succès d'inscription */}

          {/* Routes protégées */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> {/* Route pour la page de tableau de bord */}
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} /> {/* Route pour le calendrier */}
          <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} /> {/* Route pour les rendez-vous */}
          <Route path="/appointment-history" element={<ProtectedRoute><AppointmentHistory /></ProtectedRoute>} /> {/* Route pour l'historique des rendez-vous */}
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} /> {/* Route pour les clients */}
          <Route path="/clients/:id" element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} /> {/* Route pour les détails d'un client */}
          <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} /> {/* Route pour les factures */}
          <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} /> {/* Route pour les documents */}
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} /> {/* Route pour les événements */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> {/* Route pour le profil */}
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} /> {/* Route pour les paramètres */}
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} /> {/* Route pour les notifications */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App; // Exportation du composant App