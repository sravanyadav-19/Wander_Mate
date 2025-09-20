import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft,
  Navigation, 
  Clock, 
  MapPin,
  Zap,
  Mountain,
  Coffee,
  Car,
  Bookmark,
  Share,
  Cloud,
  Sun,
  CloudRain
} from "lucide-react";

const RouteDetails = () => {
  const { destination } = useParams();
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock route data
  const routes = [
    {
      id: 0,
      type: "fastest",
      icon: <Zap className="h-4 w-4" />,
      name: "Fastest Route",
      duration: "15 min",
      distance: "3.2 km",
      traffic: "Light traffic",
      description: "Main roads with minimal stops",
      highlights: ["Direct path", "Good road conditions"],
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200"
    },
    {
      id: 1,
      type: "scenic",
      icon: <Mountain className="h-4 w-4" />,
      name: "Scenic Route",
      duration: "22 min",
      distance: "4.1 km", 
      traffic: "Moderate traffic",
      description: "Beautiful views along the waterfront",
      highlights: ["Harbor views", "Historic district", "Photo opportunities"],
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200"
    },
    {
      id: 2,
      type: "recommended",
      icon: <Coffee className="h-4 w-4" />,
      name: "Local's Choice",
      duration: "18 min",
      distance: "3.8 km",
      traffic: "Light traffic", 
      description: "Discover hidden gems along the way",
      highlights: ["Local coffee shop", "Art gallery", "Quiet streets"],
      color: "text-orange-600",
      bgColor: "bg-orange-50 border-orange-200"
    }
  ];

  const pointsOfInterest = [
    { name: "Brooklyn Bridge Park", type: "Park", distance: "0.5 km from route" },
    { name: "DUMBO Coffee", type: "Coffee", distance: "0.2 km from route" },
    { name: "Jane's Carousel", type: "Attraction", distance: "0.3 km from route" }
  ];

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const { data } = await supabase.functions.invoke('weather-route', {
          body: { 
            startLat: 40.7128, 
            startLng: -74.0060,
            endLat: 40.6892, 
            endLng: -74.0445 
          }
        });
        setWeatherData(data);
      } catch (error) {
        console.error('Weather fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const startNavigation = () => {
    navigate(`/navigation/${routes[selectedRoute].id}`);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'partly cloudy':
        return <Cloud className="h-4 w-4 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="h-4 w-4 text-blue-500" />;
      default:
        return <Sun className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="p-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold truncate">Route to {destination}</h1>
            <Button variant="ghost" size="sm" className="p-2">
              <Share className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 space-y-6">
          {/* Weather Info */}
          {weatherData && (
            <Card className="bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium flex items-center gap-2">
                    {getWeatherIcon(weatherData.current.condition)}
                    Weather Along Route
                  </h3>
                  <span className="text-lg font-bold">{weatherData.current.temp}°C</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {weatherData.recommendation}
                </p>
                <div className="flex gap-4 text-xs">
                  {weatherData.route.map((point, index) => (
                    <div key={index} className="flex items-center gap-1">
                      {getWeatherIcon(point.condition)}
                      <span>{point.temp}°</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Route Options */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Choose Your Route</h2>
            <div className="space-y-3">
              {routes.map((route) => (
                <Card 
                  key={route.id}
                  className={`cursor-pointer transition-all ${
                    selectedRoute === route.id 
                      ? `${route.bgColor} ring-2 ring-current ${route.color}` 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedRoute(route.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${route.color}`}>
                          {route.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{route.name}</h3>
                          <p className="text-sm text-muted-foreground">{route.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{route.duration}</div>
                        <div className="text-sm text-muted-foreground">{route.distance}</div>
                      </div>
                    </div>
                    
                    {selectedRoute === route.id && (
                      <div className="mt-4 pt-4 border-t border-current/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{route.traffic}</span>
                        </div>
                        <div className="space-y-1">
                          {route.highlights.map((highlight, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-1 h-1 bg-current rounded-full" />
                              <span>{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Points of Interest */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Points of Interest</h2>
            <div className="space-y-2">
              {pointsOfInterest.map((poi, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-smooth">
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <h3 className="font-medium text-sm">{poi.name}</h3>
                      <p className="text-xs text-muted-foreground">{poi.distance}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {poi.type}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Bookmark className="h-4 w-4 mr-2" />
              Save Route
            </Button>
            <Button className="flex-1" onClick={startNavigation}>
              <Navigation className="h-4 w-4 mr-2" />
              Start Navigation
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default RouteDetails;