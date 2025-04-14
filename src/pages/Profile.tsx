import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Camera } from "lucide-react";
import userService, { UserProfile, UserSettings } from '@/services/api/userService';

export default function Profile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileData, settingsData] = await Promise.all([
        userService.getProfile(),
        userService.getSettings()
      ]);
      setProfile(profileData);
      setSettings(settingsData);
      setEditedProfile(profileData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing && profile) {
      setEditedProfile(profile);
    }
    setIsEditing(!isEditing);
  };

  const handleProfileChange = (field: string, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = async (field: keyof UserSettings, value: any) => {
    try {
      setLoading(true);
      const updatedSettings = await userService.updateSettings({
        ...settings,
        [field]: value
      });
      setSettings(updatedSettings);
      toast({
        title: "Succès",
        description: "Paramètres mis à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const updatedProfile = await userService.updateProfile(editedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await userService.updatePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: "Succès",
        description: "Mot de passe mis à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le mot de passe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const result = await userService.uploadAvatar(file);
      setProfile(prev => prev ? { ...prev, avatarUrl: result.avatarUrl } : null);
      toast({
        title: "Succès",
        description: "Avatar mis à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'avatar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informations du profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatarUrl} />
                    <AvatarFallback>
                      {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer"
                  >
                    <Camera className="h-4 w-4 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{profile?.firstName} {profile?.lastName}</h3>
                  <p className="text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={editedProfile.firstName || ''}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={editedProfile.lastName || ''}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedProfile.email || ''}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Téléphone</Label>
                  <Input
                    id="phoneNumber"
                    value={editedProfile.phoneNumber || ''}
                    onChange={(e) => handleProfileChange('phoneNumber', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Spécialisation</Label>
                  <Input
                    id="specialization"
                    value={editedProfile.specialization || ''}
                    onChange={(e) => handleProfileChange('specialization', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleEditToggle}>
                      Annuler
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enregistrer
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEditToggle}>
                    Modifier
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Thème</Label>
                    <p className="text-sm text-muted-foreground">
                      Choisissez votre thème préféré
                    </p>
                  </div>
                  <Select
                    value={settings?.theme}
                    onValueChange={(value) => handleSettingsChange('theme', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sélectionner un thème" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer ou désactiver les notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings?.notifications}
                    onCheckedChange={(checked) => handleSettingsChange('notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Langue</Label>
                    <p className="text-sm text-muted-foreground">
                      Choisissez votre langue préférée
                    </p>
                  </div>
                  <Select
                    value={settings?.language}
                    onValueChange={(value) => handleSettingsChange('language', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Changer le mot de passe
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
