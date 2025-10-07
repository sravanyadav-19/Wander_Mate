import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { 
  Navigation as NavigationIcon,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Clock,
  Gauge,
  Phone,
  X,
  Volume2,
  VolumeX,
  Coffee
} from "lucide-react";

const Navigation = () => {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isNavigating, setIsNavigating] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [eta, setEta] = useState("Calculating...");
  const [distanceRemaining, setDistanceRemaining] = useState("Calculating...");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showStops, setShowStops] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapToken, setMapToken] = useState<string | null>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  
  // Get destination from navigation state or session storage fallback
  const navState = (location.state as any) || (typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('nav_destination') || 'null') : null);
  const destinationName = navState?.destinationName || "destination";
  const destination = (navState?.destinationCoords as { lat: number; lng: number } | null) || null;

  const [currentInstruction, setCurrentInstruction] = useState({
    direction: "straight",
    text: "Getting your location...",
    distance: "Calculating...",
    icon: <ArrowUp className="h-6 w-6" />
  });

  const nextInstruction = {
    direction: "right",
    text: "Next instruction will appear soon",
    distance: "Then",
    icon: <ArrowRight className="h-5 w-5" />
  };

  const quickStops = [
    { name: "HP Petrol Pump", type: "Fuel", distance: "1.2 km", eta: "+5 min" },
    { name: "Café Coffee Day", type: "Coffee", distance: "2.1 km", eta: "+8 min" },
    { name: "Reliance Fresh", type: "Food", distance: "3.5 km", eta: "+12 min" }
  ];

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate ETA based on distance and average speed
  const calculateETA = (distance: number, avgSpeed: number = 50) => {
    const hours = distance / avgSpeed;
    const minutes = Math.round(hours * 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs} hr ${mins} min`;
  };

  // Fetch routes from Mapbox Directions API
  const fetchRoutes = async (startLng: number, startLat: number, endLng: number, endLat: number, token: string) => {
    try {
      // Fetch traffic-aware route
      const trafficUrl = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&steps=true&overview=full&access_token=${token}`;
      const trafficResponse = await fetch(trafficUrl);
      const trafficData = await trafficResponse.json();

      // Fetch alternative routes for shortest and highway options
      const alternativesUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?alternatives=true&geometries=geojson&steps=true&overview=full&annotations=distance,duration&access_token=${token}`;
      const alternativesResponse = await fetch(alternativesUrl);
      const alternativesData = await alternativesResponse.json();

      const fetchedRoutes = [];

      // Add traffic-aware route (primary route)
      if (trafficData.routes && trafficData.routes.length > 0) {
        const route = trafficData.routes[0];
        fetchedRoutes.push({
          name: 'traffic',
          profile: 'driving-traffic',
          color: '#3b82f6',
          label: 'Dynamic (Traffic)',
          geometry: route.geometry,
          duration: route.duration,
          distance: route.distance,
          steps: route.legs[0]?.steps || []
        });
      }

      // Add alternative routes
      if (alternativesData.routes && alternativesData.routes.length > 0) {
        // Sort by distance to get shortest route
        const sortedByDistance = [...alternativesData.routes].sort((a, b) => a.distance - b.distance);
        
        // Add shortest route (first in sorted array)
        if (sortedByDistance[0]) {
          fetchedRoutes.push({
            name: 'shortest',
            profile: 'driving',
            color: '#10b981',
            label: 'Shortest Path',
            geometry: sortedByDistance[0].geometry,
            duration: sortedByDistance[0].duration,
            distance: sortedByDistance[0].distance,
            steps: sortedByDistance[0].legs[0]?.steps || []
          });
        }

        // Add alternative route as "highway" option (typically fastest/highway route)
        if (alternativesData.routes.length > 1) {
          const alternativeRoute = alternativesData.routes[1];
          fetchedRoutes.push({
            name: 'highway',
            profile: 'driving',
            color: '#f59e0b',
            label: 'Alternative Route',
            geometry: alternativeRoute.geometry,
            duration: alternativeRoute.duration,
            distance: alternativeRoute.distance,
            steps: alternativeRoute.legs[0]?.steps || []
          });
        }
      }

      setRoutes(fetchedRoutes);
      return fetchedRoutes;
    } catch (error) {
      console.error('Error fetching routes:', error);
      return [];
    }
  };

  useEffect(() => {
    // Initialize map
    if (!mapContainer.current) return;

    // Ensure we have a Mapbox token; fetch from Supabase Edge Function if not yet loaded
    if (!mapToken) {
      (async () => {
        try {
          const { data } = await supabase.functions.invoke('mapbox-token');
          if (data?.token) setMapToken(data.token);
        } catch (e) {
          console.warn('Mapbox token fetch failed', e);
        }
      })();

      // Show helpful placeholder until token arrives
      mapContainer.current.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
          <div class="text-white text-center p-4">
            <h3 class="text-xl font-semibold mb-2">Add your Mapbox token</h3>
            <p class="text-blue-200">Set MAPBOX_PUBLIC_TOKEN in Supabase Edge Function secrets.</p>
          </div>
        </div>
      `;
      return;
    }
    if (userLocation && destination) {
      try {
        mapboxgl.accessToken = mapToken as string;
        
        // Calculate center point between user and destination
        const centerLat = (userLocation.lat + destination.lat) / 2;
        const centerLng = (userLocation.lng + destination.lng) / 2;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [centerLng, centerLat],
          zoom: 12
        });

        map.current.on('load', async () => {
          if (!map.current || !userLocation || !destination) return;

          // Fetch all route options
          const fetchedRoutes = await fetchRoutes(
            userLocation.lng,
            userLocation.lat,
            destination.lng,
            destination.lat,
            mapToken!
          );

          // Add route layers to the map (draw in reverse order so selected is on top)
          [...fetchedRoutes].reverse().forEach((route, index) => {
            if (!map.current) return;
            
            const actualIndex = fetchedRoutes.length - 1 - index;
            const layerId = `route-${actualIndex}`;
            const sourceId = `route-source-${actualIndex}`;

            // Add casing (outline) for better visibility
            const casingId = `route-casing-${actualIndex}`;
            
            map.current.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: route.geometry
              }
            });

            // Add route casing (outline)
            map.current.addLayer({
              id: casingId,
              type: 'line',
              source: sourceId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#000000',
                'line-width': actualIndex === selectedRoute ? 10 : 7,
                'line-opacity': actualIndex === selectedRoute ? 0.4 : 0.2
              }
            });

            // Add main route line
            map.current.addLayer({
              id: layerId,
              type: 'line',
              source: sourceId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': route.color,
                'line-width': actualIndex === selectedRoute ? 8 : 5,
                'line-opacity': actualIndex === selectedRoute ? 0.95 : 0.6
              }
            });
          });

          // Fit map to show all routes
          if (fetchedRoutes.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            bounds.extend([userLocation.lng, userLocation.lat]);
            bounds.extend([destination.lng, destination.lat]);
            map.current.fitBounds(bounds, { padding: 80 });
          }
        });

        // Add user location marker
        new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map.current);

        // Add destination marker
        new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat([destination.lng, destination.lat])
          .addTo(map.current);

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      } catch (error) {
        console.error('Error initializing map:', error);
        // Show fallback UI
        if (mapContainer.current) {
          mapContainer.current.innerHTML = `
            <div class="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
              <div class="text-white text-center p-4">
                <div class="mb-4">
                  <svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2">Navigating to ${destinationName}</h3>
                <p class="text-blue-200 mb-1">Distance: ${distanceRemaining}</p>
                <p class="text-blue-200">ETA: ${eta}</p>
                <div class="mt-4 bg-white/20 backdrop-blur rounded-lg p-3">
                  <p class="text-sm">📍 Add Mapbox token in Settings for interactive map</p>
                </div>
              </div>
            </div>
          `;
        }
      }
    } else {
      // Show loading state
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div class="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
            <div class="text-white text-center">
              <div class="animate-pulse mb-4">
                <svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">Getting your location...</h3>
              <p class="text-blue-200">Please wait while we calculate your route</p>
            </div>
          </div>
        `;
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [userLocation, destination, destinationName, distanceRemaining, eta, mapToken]);

  // Update route visualization when selected route changes
  useEffect(() => {
    if (!map.current || routes.length === 0) return;

    routes.forEach((route, index) => {
      const layerId = `route-${index}`;
      const casingId = `route-casing-${index}`;
      
      if (map.current?.getLayer(layerId)) {
        map.current.setPaintProperty(layerId, 'line-width', index === selectedRoute ? 8 : 5);
        map.current.setPaintProperty(layerId, 'line-opacity', index === selectedRoute ? 0.95 : 0.6);
      }
      
      if (map.current?.getLayer(casingId)) {
        map.current.setPaintProperty(casingId, 'line-width', index === selectedRoute ? 10 : 7);
        map.current.setPaintProperty(casingId, 'line-opacity', index === selectedRoute ? 0.4 : 0.2);
      }
    });

    // Update ETA and distance based on selected route
    if (routes[selectedRoute]) {
      const route = routes[selectedRoute];
      setDistanceRemaining(`${(route.distance / 1000).toFixed(1)} km`);
      setEta(`${Math.round(route.duration / 60)} min`);
    }
  }, [selectedRoute, routes]);

  useEffect(() => {
    // Get real GPS location and speed data
    if (!destination) {
      setCurrentInstruction({
        direction: "straight",
        text: "No destination set",
        distance: "N/A",
        icon: <MapPin className="h-6 w-6" />
      });
      return;
    }

    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed } = position.coords;
          
          // Update user location
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Calculate distance to destination
          const distance = calculateDistance(latitude, longitude, destination.lat, destination.lng);
          setDistanceRemaining(`${distance.toFixed(1)} km`);
          
          // Calculate ETA
          const currentSpeedKmh = speed ? Math.round(speed * 3.6) : 50;
          setEta(calculateETA(distance, currentSpeedKmh));
          
          // Update navigation instruction based on distance
          if (distance < 1) {
            setCurrentInstruction({
              direction: "straight",
              text: "Approaching destination",
              distance: `${Math.round(distance * 1000)} m`,
              icon: <MapPin className="h-6 w-6" />
            });
          } else {
            setCurrentInstruction({
              direction: "straight",
              text: "Continue toward destination",
              distance: `${distance.toFixed(1)} km`,
              icon: <ArrowUp className="h-6 w-6" />
            });
          }
          
          // Update speed
          if (speed !== null) {
            const speedKmh = Math.round(speed * 3.6);
            setCurrentSpeed(speedKmh > 0 ? speedKmh : 0);
          }
        },
        (error) => {
          console.warn('Error getting GPS data:', error);
          // Fallback to demo data
          setCurrentSpeed(Math.floor(Math.random() * 20) + 45);
          setDistanceRemaining("18.5 km");
          setEta("25 min");
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 5000
        }
      );
      setWatchId(id);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId, destination]);

  const endNavigation = () => {
    setIsNavigating(false);
    sessionStorage.removeItem('nav_destination');
    navigate(`/trip-complete/${routeId}`);
  };

  const emergencyCall = () => {
    // In a real app, this would call emergency services
    alert("Emergency services feature - would call 911 in production");
  };

  return (
    <AppLayout showBottomNav={false}>
      <div className="flex flex-col h-screen bg-slate-900 text-white">
        {/* Map Area */}
        <div className="flex-1 relative">
          {/* Real Map */}
          <div ref={mapContainer} className="absolute inset-0" />

          {/* Speed and Status */}
          <div className="absolute top-4 left-4 flex gap-3">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              <span className="font-mono text-lg">{currentSpeed}</span>
              <span className="text-sm text-white/70">km/h</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>

          {/* Emergency Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={emergencyCall}
            className="absolute top-4 right-4 bg-red-600 hover:bg-red-700"
          >
            <Phone className="h-4 w-4 mr-1" />
            SOS
          </Button>

          {/* Route Options Button */}
          {routes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRouteOptions(!showRouteOptions)}
              className="absolute bottom-20 right-4 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
            >
              <NavigationIcon className="h-4 w-4 mr-1" />
              Routes
            </Button>
          )}

          {/* Quick Stops Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStops(!showStops)}
            className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
          >
            <Coffee className="h-4 w-4" />
          </Button>

          {/* Route Options Panel */}
          {showRouteOptions && routes.length > 0 && (
            <Card className="absolute bottom-20 left-4 right-4 max-w-md mx-auto">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-foreground">Route Options</h3>
                <div className="space-y-2">
                  {routes.map((route, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedRoute(index);
                        setShowRouteOptions(false);
                      }}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedRoute === index 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border bg-background hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: route.color }}
                          />
                          <span className="font-medium text-foreground">{route.label}</span>
                        </div>
                        {selectedRoute === index && (
                          <span className="text-xs text-primary font-medium">ACTIVE</span>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground ml-5">
                        <span>{(route.distance / 1000).toFixed(1)} km</span>
                        <span>{Math.round(route.duration / 60)} min</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Instructions */}
        <div className="bg-background text-foreground">
          {/* Main Instruction */}
          <div className="px-4 py-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="bg-primary text-primary-foreground rounded-full p-3">
                {currentInstruction.icon}
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold mb-1">
                  {currentInstruction.text}
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentInstruction.distance}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg">{eta}</div>
                <div className="text-sm text-muted-foreground">{distanceRemaining}</div>
              </div>
            </div>
          </div>

          {/* Next Instruction */}
          <div className="px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground">
                {nextInstruction.icon}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">{nextInstruction.distance}</span>
                <span className="ml-2">{nextInstruction.text}</span>
              </div>
            </div>
          </div>

          {/* Quick Stops */}
          {showStops && (
            <div className="px-4 py-3 border-t border-border">
              <h3 className="font-medium mb-3 text-sm">Quick Stops Nearby</h3>
              <div className="space-y-2">
                {quickStops.map((stop, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <div>
                      <div className="font-medium text-sm">{stop.name}</div>
                      <div className="text-xs text-muted-foreground">{stop.type} • {stop.distance}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{stop.eta}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* End Navigation Button */}
          <div className="p-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={endNavigation}
            >
              <X className="h-4 w-4 mr-2" />
              End Navigation
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Navigation;