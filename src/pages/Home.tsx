import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Search, MapPin, Clock, Compass, Route, Star } from "lucide-react";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState("Getting location...");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              // Use reverse geocoding to get city name
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              const data = await response.json();
              setCurrentLocation(data.city && data.countryCode 
                ? `${data.city}, ${data.countryCode}` 
                : "Unknown Location"
              );
            } catch (error) {
              console.error('Error getting location name:', error);
              setCurrentLocation("Location unavailable");
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            setCurrentLocation("Location unavailable");
          }
        );
      } else {
        setCurrentLocation("Location not supported");
      }
    };

    getLocation();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickActions = [
    {
      icon: Route,
      title: "Plan Trip",
      description: "Create a new journey",
      path: "/plan-trip",
      color: "bg-primary text-primary-foreground"
    },
    {
      icon: Clock,
      title: "View History",
      description: "See past adventures",
      path: "/history",
      color: "bg-secondary text-secondary-foreground"
    },
    {
      icon: Compass,
      title: "Explore Nearby",
      description: "Discover local gems",
      path: "/discover",
      color: "bg-accent text-accent-foreground"
    }
  ];

  const recentDestinations = [
    { name: "Central Park", distance: "2.5 km", rating: 4.8 },
    { name: "Brooklyn Bridge", distance: "5.1 km", rating: 4.9 },
    { name: "Times Square", distance: "3.2 km", rating: 4.6 },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="gradient-hero text-white px-4 py-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}!</h1>
              <p className="text-white/80">Where will you wander today?</p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span className="text-sm">{currentLocation}</span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Where to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/95 border-0 shadow-elegant"
            />
          </form>
        </header>

        <div className="flex-1 px-4 py-6 space-y-6">
          {/* Quick Actions */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card 
                    key={action.path}
                    className="cursor-pointer transition-smooth hover:shadow-elegant"
                    onClick={() => navigate(action.path)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`p-3 rounded-full ${action.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Recent Destinations */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Recent Destinations</h2>
            <div className="space-y-3">
              {recentDestinations.map((destination, index) => (
                <Card key={index} className="cursor-pointer transition-smooth hover:shadow-elegant">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{destination.name}</h3>
                        <p className="text-sm text-muted-foreground">{destination.distance}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{destination.rating}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Weather Widget */}
          <Card className="gradient-subtle">
            <CardHeader>
              <CardTitle className="text-lg">Today's Weather</CardTitle>
              <CardDescription>Perfect for exploring!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">☀️</div>
                  <div>
                    <p className="text-2xl font-bold">22°C</p>
                    <p className="text-sm text-muted-foreground">Sunny</p>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>High: 25°C</p>
                  <p>Low: 18°C</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;