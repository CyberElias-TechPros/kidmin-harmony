import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, Bell, Palette, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SETTINGS_KEY = "kidmin_settings";

interface AppSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  compactView: boolean;
}

const defaultSettings: AppSettings = {
  emailNotifications: true,
  pushNotifications: false,
  compactView: false,
};

const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    toast.success("Settings saved");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your KidMin Harmony experience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Bell className="mr-2 h-5 w-5" /> Notifications</CardTitle>
          <CardDescription>Choose how you'd like to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email">Email notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              id="email"
              checked={settings.emailNotifications}
              onCheckedChange={(v) => update({ emailNotifications: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push">Push notifications</Label>
              <p className="text-sm text-muted-foreground">Get real-time alerts on your device</p>
            </div>
            <Switch
              id="push"
              checked={settings.pushNotifications}
              onCheckedChange={(v) => update({ pushNotifications: v })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5" /> Appearance</CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compact">Compact view</Label>
              <p className="text-sm text-muted-foreground">Reduce spacing to fit more content</p>
            </div>
            <Switch
              id="compact"
              checked={settings.compactView}
              onCheckedChange={(v) => update({ compactView: v })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Shield className="mr-2 h-5 w-5" /> Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Signed in as {user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/profile")}>Edit Profile</Button>
            <Button variant="destructive" onClick={logout}><LogOut className="mr-2 h-4 w-4" /> Log out</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
