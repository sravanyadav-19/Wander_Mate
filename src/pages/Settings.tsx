import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  ArrowLeft,
  Bell,
  Volume2,
  MapPin,
  Shield,
  Smartphone,
  Globe,
  Fuel,
  Route,
  Eye,
  Download
} from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    voiceGuidance: true,
    locationSharing: false,
    offlineMode: true,
    metricUnits: true,
    darkMode: false,
    dataUsage: 'wifi',
    routePreference: 'fastest',
    voiceLanguage: 'en'
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="p-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 space-y-6">
          {/* Navigation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Voice Guidance</div>
                  <div className="text-sm text-muted-foreground">Turn-by-turn voice instructions</div>
                </div>
                <Switch
                  checked={settings.voiceGuidance}
                  onCheckedChange={(checked) => updateSetting('voiceGuidance', checked)}
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium">Default Route Type</label>
                <Select 
                  value={settings.routePreference} 
                  onValueChange={(value) => updateSetting('routePreference', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fastest">Fastest Route</SelectItem>
                    <SelectItem value="scenic">Scenic Route</SelectItem>
                    <SelectItem value="eco">Eco-Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Voice Language</label>
                <Select 
                  value={settings.voiceLanguage} 
                  onValueChange={(value) => updateSetting('voiceLanguage', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Metric Units</div>
                  <div className="text-sm text-muted-foreground">Use kilometers and celsius</div>
                </div>
                <Switch
                  checked={settings.metricUnits}
                  onCheckedChange={(checked) => updateSetting('metricUnits', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-muted-foreground">Trip updates and recommendations</div>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSetting('notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Location Sharing</div>
                  <div className="text-sm text-muted-foreground">Share location with emergency contacts</div>
                </div>
                <Switch
                  checked={settings.locationSharing}
                  onCheckedChange={(checked) => updateSetting('locationSharing', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data & Storage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data & Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Offline Mode</div>
                  <div className="text-sm text-muted-foreground">Download maps for offline use</div>
                </div>
                <Switch
                  checked={settings.offlineMode}
                  onCheckedChange={(checked) => updateSetting('offlineMode', checked)}
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium">Data Usage</label>
                <Select 
                  value={settings.dataUsage} 
                  onValueChange={(value) => updateSetting('dataUsage', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Always Use Data</SelectItem>
                    <SelectItem value="wifi">WiFi Only</SelectItem>
                    <SelectItem value="limited">Limited Data Usage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Dark Mode</div>
                  <div className="text-sm text-muted-foreground">Use dark theme</div>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle>About WanderMate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Build</span>
                <span>2024.01.15</span>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                  Privacy Policy
                </Button>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                  Terms of Service
                </Button>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                  Help & Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;