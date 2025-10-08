import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus,
  MapPin,
  Clock,
  Calendar,
  Navigation,
  X,
  Route,
  Shuffle,
  Save
} from "lucide-react";

interface Suggestion {
  place_name: string;
  center: [number, number];
}

const TripPlanning = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialDestination = searchParams.get("destination") || "";
  
  const [destinations, setDestinations] = useState<string[]>(
    initialDestination ? [initialDestination] : [""]
  );
  const [tripName, setTripName] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [routePreference, setRoutePreference] = useState("fastest");
  const [suggestions, setSuggestions] = useState<Suggestion[][]>([]);
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  const [mapToken, setMapToken] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const routeOptions = [
    { id: "fastest", label: "Fastest", description: "Minimize travel time" },
    { id: "scenic", label: "Scenic", description: "Beautiful views and interesting stops" },
    { id: "efficient", label: "Efficient", description: "Balance time and fuel consumption" }
  ];

  // Fetch Mapbox token
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.functions.invoke('mapbox-token');
        if (data?.token) setMapToken(data.token);
      } catch (e) {
        console.warn('Mapbox token fetch failed', e);
      }
    })();
  }, []);

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (query: string, index: number) => {
    if (!query.trim() || query.length < 2 || !mapToken) {
      const newSuggestions = [...suggestions];
      newSuggestions[index] = [];
      setSuggestions(newSuggestions);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapToken}&limit=5&autocomplete=true`
      );
      const data = await response.json();
      
      if (data.features) {
        const newSuggestions = [...suggestions];
        newSuggestions[index] = data.features;
        setSuggestions(newSuggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Handle clicking outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setFocusedInput(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectSuggestion = (index: number, suggestion: Suggestion) => {
    updateDestination(index, suggestion.place_name);
    const newSuggestions = [...suggestions];
    newSuggestions[index] = [];
    setSuggestions(newSuggestions);
    setFocusedInput(null);
  };

  // Mock optimized itinerary
  const optimizedRoute = {
    totalDistance: "12.5 km",
    totalTime: "45 min",
    estimatedFuel: "1.2L",
    stops: destinations.filter(d => d.trim()).length,
    route: destinations.filter(d => d.trim()).map((dest, index) => ({
      order: index + 1,
      name: dest,
      estimatedTime: `${5 + index * 3} min`,
      distance: index === 0 ? "0 km" : `${2.1 + index * 1.5} km`
    }))
  };

  const addDestination = () => {
    setDestinations([...destinations, ""]);
  };

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((_, i) => i !== index));
    }
  };

  const updateDestination = (index: number, value: string) => {
    const newDestinations = [...destinations];
    newDestinations[index] = value;
    setDestinations(newDestinations);
    fetchSuggestions(value, index);
  };

  const optimizeRoute = () => {
    // Mock optimization - in production, this would call a route optimization API
    const shuffled = [...destinations.filter(d => d.trim())];
    // Simple optimization simulation
    setDestinations(shuffled);
  };

  const startTrip = () => {
    if (destinations.filter(d => d.trim()).length < 1) {
      return;
    }
    // In production, save the planned trip and start navigation
    navigate(`/route/${destinations.filter(d => d.trim())[0]}`);
  };

  const saveTripPlan = () => {
    // Save trip plan for later
    console.log("Saving trip plan:", { tripName, destinations, routePreference });
  };

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="gradient-hero text-white px-4 py-6">
          <h1 className="text-2xl font-bold mb-2">Plan Your Trip</h1>
          <p className="text-white/80">Create the perfect multi-destination journey</p>
        </header>

        <div className="flex-1 px-4 py-6 space-y-6">
          {/* Trip Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Trip Name (Optional)</label>
            <Input
              placeholder="Weekend Adventure"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
            />
          </div>

          {/* Destinations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Destinations</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={addDestination}
                disabled={destinations.length >= 8}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Stop
              </Button>
            </div>
            
            <div className="space-y-3">
              {destinations.map((destination, index) => (
                <div key={index} className="relative flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                    {index === 0 ? "S" : index === destinations.length - 1 && destinations.length > 1 ? "E" : index}
                  </div>
                  <div className="flex-1 relative">
                    <Input
                      placeholder={index === 0 ? "Starting point" : `Destination ${index}`}
                      value={destination}
                      onChange={(e) => updateDestination(index, e.target.value)}
                      onFocus={() => setFocusedInput(index)}
                      className="flex-1"
                    />
                    {/* Autocomplete Suggestions Dropdown */}
                    {focusedInput === index && suggestions[index]?.length > 0 && (
                      <div 
                        ref={suggestionsRef}
                        className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                      >
                        {suggestions[index].map((suggestion, suggestionIndex) => (
                          <button
                            key={suggestionIndex}
                            onClick={() => selectSuggestion(index, suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-start gap-3 border-b border-border last:border-0"
                          >
                            <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                            <span className="text-sm">{suggestion.place_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {destinations.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDestination(index)}
                      className="p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Route Preferences */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Route Preferences</h2>
            <div className="space-y-2">
              {routeOptions.map((option) => (
                <Card 
                  key={option.id}
                  className={`cursor-pointer transition-all ${
                    routePreference === option.id ? 'bg-primary/5 border-primary' : ''
                  }`}
                  onClick={() => setRoutePreference(option.id)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      routePreference === option.id 
                        ? 'bg-primary border-primary' 
                        : 'border-muted-foreground'
                    }`} />
                    <div>
                      <h3 className="font-medium">{option.label}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Optimized Route Preview */}
          {destinations.filter(d => d.trim()).length > 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Route Overview</CardTitle>
                  <Button variant="outline" size="sm" onClick={optimizeRoute}>
                    <Shuffle className="h-4 w-4 mr-2" />
                    Optimize
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Route Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <MapPin className="h-5 w-5 text-primary mx-auto mb-1" />
                    <div className="font-semibold">{optimizedRoute.totalDistance}</div>
                    <div className="text-xs text-muted-foreground">Distance</div>
                  </div>
                  <div>
                    <Clock className="h-5 w-5 text-secondary mx-auto mb-1" />
                    <div className="font-semibold">{optimizedRoute.totalTime}</div>
                    <div className="text-xs text-muted-foreground">Time</div>
                  </div>
                  <div>
                    <Route className="h-5 w-5 text-accent mx-auto mb-1" />
                    <div className="font-semibold">{optimizedRoute.stops}</div>
                    <div className="text-xs text-muted-foreground">Stops</div>
                  </div>
                </div>

                {/* Route Steps */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Route Order</h4>
                  {optimizedRoute.route.map((stop, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {stop.order}
                        </Badge>
                        <span className="text-sm">{stop.name}</span>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>{stop.distance}</div>
                        <div>{stop.estimatedTime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={saveTripPlan}
              disabled={!destinations.some(d => d.trim())}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Plan
            </Button>
            <Button 
              className="flex-1"
              onClick={startTrip}
              disabled={!destinations.some(d => d.trim())}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Start Trip
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TripPlanning;