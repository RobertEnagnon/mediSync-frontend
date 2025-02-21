import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Settings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  theme: "light" | "dark" | "system";
  language: string;
  workingHours: {
    start: string;
    end: string;
  };
  appointmentDuration: number;
}

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    theme: "system",
    language: "fr",
    workingHours: {
      start: "09:00",
      end: "18:00",
    },
    appointmentDuration: 30,
  });

  const handleNotificationChange = (type: keyof Settings["notifications"]) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type],
      },
    }));
  };

  const handleThemeChange = (value: Settings["theme"]) => {
    setSettings((prev) => ({ ...prev, theme: value }));
  };

  const handleLanguageChange = (value: string) => {
    setSettings((prev) => ({ ...prev, language: value }));
  };

  const handleWorkingHoursChange = (type: "start" | "end", value: string) => {
    setSettings((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [type]: value,
      },
    }));
  };

  const handleAppointmentDurationChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      appointmentDuration: parseInt(value),
    }));
  };

  const saveSettings = async () => {
    try {
      // Appel API pour sauvegarder les paramètres
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Paramètres mis à jour avec succès",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="schedule">Horaires</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Généraux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Thème</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={handleThemeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="system">Système</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Langue</Label>
                  <Select
                    value={settings.language}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
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

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">
                    Notifications par email
                  </Label>
                  <Switch
                    id="email-notifications"
                    checked={settings.notifications.email}
                    onCheckedChange={() => handleNotificationChange("email")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">
                    Notifications par SMS
                  </Label>
                  <Switch
                    id="sms-notifications"
                    checked={settings.notifications.sms}
                    onCheckedChange={() => handleNotificationChange("sms")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">
                    Notifications push
                  </Label>
                  <Switch
                    id="push-notifications"
                    checked={settings.notifications.push}
                    onCheckedChange={() => handleNotificationChange("push")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres des Horaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Heure de début</Label>
                  <input
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) =>
                      handleWorkingHoursChange("start", e.target.value)
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <Label>Heure de fin</Label>
                  <input
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) =>
                      handleWorkingHoursChange("end", e.target.value)
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <Label>Durée des rendez-vous</Label>
                <Select
                  value={settings.appointmentDuration.toString()}
                  onValueChange={handleAppointmentDurationChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 heure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button onClick={saveSettings}>Enregistrer les modifications</Button>
      </div>
    </div>
  );
};

export default Settings;
