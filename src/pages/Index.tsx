import { Card } from "@/components/ui/card"; // Importation du composant Card
import Layout from "@/components/Layout"; // Importation du composant Layout
import { Calendar, Clock, Users } from "lucide-react"; // Importation des icônes
import { useNavigate } from "react-router-dom"; // Importation de useNavigate pour la navigation

// Déclaration du composant Index
const Index = () => {
  const navigate = useNavigate(); // Hook pour la navigation

  // Définition des statistiques à afficher
  const stats = [
    {
      title: "Rendez-vous aujourd'hui", // Titre de la statistique
      value: "8", // Valeur de la statistique
      icon: Clock, // Icône associée
      color: "text-blue-500", // Couleur de l'icône
      link: "/appointments" // Lien vers la page des rendez-vous
    },
    {
      title: "Total Clients",
      value: "124",
      icon: Users,
      color: "text-green-500",
      link: "/clients"
    },
    {
      title: "Cette semaine",
      value: "32",
      icon: Calendar,
      color: "text-purple-500",
      link: "/calendar"
    }
  ];

  return (
    <Layout> {/* Utilisation du composant Layout pour la structure de la page */}
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1> {/* Titre principal */}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Grille pour les statistiques */}
          {stats.map((stat) => ( // Itération sur les statistiques
            <Card 
              key={stat.title} // Clé unique pour chaque carte
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow" // Styles de la carte
              onClick={() => navigate(stat.link)} // Navigation vers le lien associé
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p> {/* Affichage du titre */}
                  <p className="text-2xl font-bold mt-1">{stat.value}</p> {/* Affichage de la valeur */}
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} /> {/* Affichage de l'icône */}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> {/* Grille pour les rendez-vous récents et nouveaux clients */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Rendez-vous récents</h2> {/* Titre pour les rendez-vous récents */}
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => ( // Itération pour afficher des exemples de rendez-vous
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Jean Dupont</p> {/* Nom du client */}
                    <p className="text-sm text-gray-500">Consultation régulière</p> {/* Description du rendez-vous */}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">14:00</p> {/* Heure du rendez-vous */}
                    <p className="text-sm text-gray-500">Aujourd'hui</p> {/* Date du rendez-vous */}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Nouveaux clients</h2> {/* Titre pour les nouveaux clients */}
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => ( // Itération pour afficher des exemples de nouveaux clients
                <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-500" /> {/* Icône pour le client */}
                  </div>
                  <div>
                    <p className="font-medium">Marie Martin</p> {/* Nom du client */}
                    <p className="text-sm text-gray-500">Inscrit il y a 2 jours</p> {/* Détails de l'inscription */}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index; // Exportation du composant Index