import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  specialization?: string;
  phoneNumber?: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    // Charger les données du profil depuis l'API
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${user?.id}`);
        const data = await response.json();
        setProfile(data);
        setFormData(data);
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil",
          variant: "destructive",
        });
      }
    };

    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setProfile(formData as UserProfile);
        setIsEditing(false);
        toast({
          title: "Succès",
          description: "Profil mis à jour avec succès",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    }
  };

  if (!profile) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profil Utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
              </Avatar>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Modifier le profil
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Spécialisation</Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    value={formData.specialization || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Téléphone</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">Enregistrer</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(profile);
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Nom</Label>
                  <p className="text-lg">{profile.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-lg">{profile.email}</p>
                </div>
                <div>
                  <Label>Rôle</Label>
                  <p className="text-lg">{profile.role}</p>
                </div>
                {profile.specialization && (
                  <div>
                    <Label>Spécialisation</Label>
                    <p className="text-lg">{profile.specialization}</p>
                  </div>
                )}
                {profile.phoneNumber && (
                  <div>
                    <Label>Téléphone</Label>
                    <p className="text-lg">{profile.phoneNumber}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
