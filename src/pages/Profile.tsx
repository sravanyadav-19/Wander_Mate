import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Settings, 
  MapPin, 
  Clock, 
  Camera, 
  Star,
  Trophy,
  Target,
  Calendar,
  LogOut
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const stats = [
    { icon: MapPin, label: "Total Distance", value: "142.5 km", color: "text-primary" },
    { icon: Clock, label: "Total Time", value: "28h 45m", color: "text-secondary" },
    { icon: Calendar, label: "Trips Completed", value: "23", color: "text-accent" },
    { icon: Camera, label: "Photos Taken", value: "156", color: "text-primary" }
  ];

  const achievements = [
    { icon: Trophy, title: "First Journey", description: "Completed your first trip", unlocked: true },
    { icon: Target, title: "Explorer", description: "Visit 10 different places", unlocked: true },
    { icon: Star, title: "Navigator", description: "Complete 25 trips", unlocked: false },
    { icon: MapPin, title: "Wanderer", description: "Travel 200km total", unlocked: false }
  ];

  const menuItems = [
    { icon: Settings, label: "Settings", description: "App preferences and privacy" },
    { icon: MapPin, label: "Saved Places", description: "Your favorite destinations" },
    { icon: Clock, label: "Trip History", description: "View all your journeys" },
    { icon: Star, label: "Reviews", description: "Rate your experiences" }
  ];

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        {/* Profile Header */}
        <header className="gradient-hero text-white px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {user?.user_metadata?.full_name || "WanderMate User"}
              </h1>
              <p className="text-white/80">{user?.email}</p>
              <p className="text-white/60 text-sm mt-1">Member since January 2024</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            {stats.slice(0, 2).map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{stat.label}</span>
                  </div>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </header>

        <div className="flex-1 px-4 py-6 space-y-6">
          {/* Full Stats */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Your Journey Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-4 text-center">
                      <Icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Achievements */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Achievements</h2>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <Card 
                    key={index} 
                    className={`${achievement.unlocked ? 'bg-primary/5 border-primary/20' : 'opacity-60'}`}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h3 className="font-medium text-sm">{achievement.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                      {achievement.unlocked && (
                        <div className="mt-2">
                          <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Menu Items */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Settings & More</h2>
            <div className="space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const handleClick = () => {
                  if (item.label === "Settings") {
                    navigate("/settings");
                  }
                  // Add other navigation cases as needed
                };
                return (
                  <Card key={index} className="cursor-pointer transition-smooth hover:shadow-elegant" onClick={handleClick}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.label}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <Separator />

          {/* Sign Out Button */}
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;