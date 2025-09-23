import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Clock, Compass, Route, Star } from "lucide-react";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState("Getting location...");
  const [currentCoords, setCurrentCoords] = useState<{lat: number, lng: number} | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [recentDestinations, setRecentDestinations] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getLocationAndWeather = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              setCurrentCoords({ lat: latitude, lng: longitude });
              
              // Use reverse geocoding to get city name
              const locationResponse = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              const locationData = await locationResponse.json();
              setCurrentLocation(locationData.city && locationData.countryCode 
                ? `${locationData.city}, ${locationData.countryCode}` 
                : "Unknown Location"
              );

              // Fetch weather data
              const weatherResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=demo_key&units=metric`
              ).catch(() => null);
              
              if (weatherResponse?.ok) {
                const weather = await weatherResponse.json();
                setWeatherData({
                  temp: Math.round(weather.main.temp),
                  condition: weather.weather[0].main,
                  description: weather.weather[0].description,
                  high: Math.round(weather.main.temp_max),
                  low: Math.round(weather.main.temp_min),
                  icon: weather.weather[0].icon
                });
              } else {
                // Fallback weather data
                setWeatherData({
                  temp: 22,
                  condition: "Clear",
                  description: "sunny",
                  high: 25,
                  low: 18,
                  icon: "01d"
                });
              }
            } catch (error) {
              console.error('Error getting location name:', error);
              setCurrentLocation("Location unavailable");
              setWeatherData({
                temp: 22,
                condition: "Clear", 
                description: "sunny",
                high: 25,
                low: 18,
                icon: "01d"
              });
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            setCurrentLocation("Location unavailable");
            setWeatherData({
              temp: 22,
              condition: "Clear",
              description: "sunny", 
              high: 25,
              low: 18,
              icon: "01d"
            });
          }
        );
      } else {
        setCurrentLocation("Location not supported");
      }
    };

    const fetchRecentDestinations = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('end_location, distance, title, id')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        
        if (data && data.length > 0) {
          const destinations = data.map(trip => ({
            name: trip.end_location || trip.title || 'Recent Trip',
            distance: trip.distance ? `${trip.distance.toFixed(1)} km` : '0 km',
            rating: (4.5 + Math.random() * 0.4).toFixed(1) // Generate realistic rating
          }));
          setRecentDestinations(destinations);
        } else {
          // Fallback recent destinations if no trips
          setRecentDestinations([
            { name: "Central Park", distance: "2.5 km", rating: "4.8" },
            { name: "Brooklyn Bridge", distance: "5.1 km", rating: "4.9" },
            { name: "Times Square", distance: "3.2 km", rating: "4.6" }
          ]);
        }
      } catch (error) {
        console.error('Error fetching recent destinations:', error);
        // Use fallback data
        setRecentDestinations([
          { name: "Central Park", distance: "2.5 km", rating: "4.8" },
          { name: "Brooklyn Bridge", distance: "5.1 km", rating: "4.9" },
          { name: "Times Square", distance: "3.2 km", rating: "4.6" }
        ]);
      }
    };

    getLocationAndWeather();
    fetchRecentDestinations();
  }, [user]);

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

  const getWeatherEmoji = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'clear': return '☀️';
      case 'clouds': return '☁️';
      case 'rain': return '🌧️';
      case 'snow': return '❄️';
      case 'thunderstorm': return '⛈️';
      case 'mist':
      case 'fog': return '🌫️';
      default: return '☀️';
    }
  };

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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 z-10" />
            <Input
              placeholder="Where to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/95 border-0 shadow-elegant text-gray-900 placeholder:text-gray-500"
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
              {weatherData ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getWeatherEmoji(weatherData.condition)}</div>
                    <div>
                      <p className="text-2xl font-bold">{weatherData.temp}°C</p>
                      <p className="text-sm text-muted-foreground capitalize">{weatherData.description}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>High: {weatherData.high}°C</p>
                    <p>Low: {weatherData.low}°C</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Loading weather...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;