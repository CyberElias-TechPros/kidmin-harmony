import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LogOut, Moon, Palette, Shield, Sun, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { usePageMeta } from "@/hooks/usePageMeta";

const themeOptions = [
  { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
  { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
  { value: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
] as const;

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  usePageMeta({ title: "Settings — KidMin Harmony" });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your KidMin Harmony experience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="mr-2 h-5 w-5" /> Appearance
          </CardTitle>
          <CardDescription>
            Choose how KidMin Harmony looks on this device.
            {resolvedTheme ? ` Currently using the ${resolvedTheme} theme.` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3" role="radiogroup" aria-label="Theme">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={theme === option.value}
                onClick={() => setTheme(option.value)}
                className={`flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                  theme === option.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                {option.icon}
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" /> Account
          </CardTitle>
          <CardDescription>Manage your profile and session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Signed in as {user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/profile")}>
              Edit Profile
            </Button>
            <Button variant="destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
