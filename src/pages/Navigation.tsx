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
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const destMarker = useRef<mapboxgl.Marker | null>(null);
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
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
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

  const [nextInstruction, setNextInstruction] = useState({
    direction: "right",
    text: "Next instruction will appear soon",
    distance: "Then",
    icon: <ArrowRight className="h-5 w-5" />
  });

  // Get instruction icon based on maneuver type
  const getInstructionIcon = (maneuver: string) => {
    if (maneuver.includes('left')) return <ArrowLeft className="h-6 w-6" />;
    if (maneuver.includes('right')) return <ArrowRight className="h-6 w-6" />;
    if (maneuver.includes('straight')) return <ArrowUp className="h-6 w-6" />;
    return <ArrowUp className="h-6 w-6" />;
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

  // Fetch Mapbox token on mount
  useEffect(() => {
    if (!mapToken) {
      (async () => {
        try {
          const { data } = await supabase.functions.invoke('mapbox-token');
          if (data?.token) setMapToken(data.token);
        } catch (e) {
          console.warn('Mapbox token fetch failed', e);
        }
      })();
    }
  }, []);

  // Initialize map once (no userLocation dependency to prevent re-renders)
  useEffect(() => {
    if (!mapContainer.current || !mapToken || !destination) return;
    if (map.current) return; // Map already initialized

    try {
      mapboxgl.accessToken = mapToken;
      
      // Use initial user location or destination for center
      const initialLat = userLocation?.lat || destination.lat;
      const initialLng = userLocation?.lng || destination.lng;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [initialLng, initialLat],
        zoom: 12
      });

      map.current.on('load', async () => {
        if (!map.current || !destination) return;
        
        const startLng = userLocation?.lng || destination.lng;
        const startLat = userLocation?.lat || destination.lat;

        // Fetch all route options
        const fetchedRoutes = await fetchRoutes(
          startLng,
          startLat,
          destination.lng,
          destination.lat,
          mapToken!
        );
        
        setRoutes(fetchedRoutes);

        // Add route layers to the map (draw in reverse order so selected is on top)
        [...fetchedRoutes].reverse().forEach((route, index) => {
          if (!map.current) return;
          
          const actualIndex = fetchedRoutes.length - 1 - index;
          const layerId = `route-${actualIndex}`;
          const sourceId = `route-source-${actualIndex}`;
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

        // Show full route initially
        if (fetchedRoutes.length > 0 && userLocation) {
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([userLocation.lng, userLocation.lat]);
          bounds.extend([destination.lng, destination.lat]);
          map.current.fitBounds(bounds, { padding: 100, duration: 1000 });
          
          // After 2.5 seconds, zoom to user location for navigation
          setTimeout(() => {
            if (map.current && userLocation) {
              map.current.flyTo({
                center: [userLocation.lng, userLocation.lat],
                zoom: 16,
                pitch: 45,
                bearing: 0,
                duration: 2000,
                essential: true
              });
            }
          }, 2500);
        }
      });

      // Create user location marker
      if (userLocation) {
        userMarker.current = new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map.current);
      }

      // Create destination marker
      destMarker.current = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map.current);

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (userMarker.current) {
        userMarker.current.remove();
        userMarker.current = null;
      }
      if (destMarker.current) {
        destMarker.current.remove();
        destMarker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapToken, destination]);

  // Update route visualization and instructions when selected route changes
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
      
      // Update turn-by-turn instructions
      if (route.steps && route.steps.length > 0) {
        setCurrentStepIndex(0);
        const currentStep = route.steps[0];
        setCurrentInstruction({
          direction: currentStep.maneuver?.type || "straight",
          text: currentStep.maneuver?.instruction || "Start journey",
          distance: `${(currentStep.distance / 1000).toFixed(1)} km`,
          icon: getInstructionIcon(currentStep.maneuver?.type || "straight")
        });
        
        if (route.steps.length > 1) {
          const nextStep = route.steps[1];
          setNextInstruction({
            direction: nextStep.maneuver?.type || "straight",
            text: nextStep.maneuver?.instruction || "Continue",
            distance: "Then",
            icon: getInstructionIcon(nextStep.maneuver?.type || "straight")
          });
        }
      }
    }
  }, [selectedRoute, routes]);

  // Track user location and update instructions
  useEffect(() => {
    if (!destination) return;

    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed } = position.coords;
          
          // Update user location state
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Update user marker position and keep map centered on user
          if (userMarker.current) {
            userMarker.current.setLngLat([longitude, latitude]);
            
            // Keep map centered on user during navigation with smooth animation
            if (map.current && isNavigating) {
              map.current.easeTo({
                center: [longitude, latitude],
                duration: 1000
              });
            }
          }
          
          // Update speed
          if (speed !== null) {
            const speedKmh = Math.round(speed * 3.6);
            setCurrentSpeed(speedKmh > 0 ? speedKmh : 0);
          }
          
          // Update instructions based on current position and route steps
          if (routes.length > 0 && routes[selectedRoute]?.steps) {
            const steps = routes[selectedRoute].steps;
            
            // Find current step based on distance
            let cumulativeDistance = 0;
            let currentIdx = currentStepIndex;
            
            for (let i = currentStepIndex; i < steps.length; i++) {
              const step = steps[i];
              if (step.maneuver?.location) {
                const distToStep = calculateDistance(
                  latitude,
                  longitude,
                  step.maneuver.location[1],
                  step.maneuver.location[0]
                );
                
                // If we're close to the next step, advance
                if (distToStep < 0.05 && i > currentStepIndex) { // 50m threshold
                  currentIdx = i;
                  setCurrentStepIndex(i);
                  break;
                }
              }
            }
            
            // Update current and next instructions
            if (currentIdx < steps.length) {
              const currentStep = steps[currentIdx];
              const distToCurrentStep = currentStep.maneuver?.location 
                ? calculateDistance(
                    latitude,
                    longitude,
                    currentStep.maneuver.location[1],
                    currentStep.maneuver.location[0]
                  )
                : currentStep.distance / 1000;
              
              setCurrentInstruction({
                direction: currentStep.maneuver?.type || "straight",
                text: currentStep.maneuver?.instruction || "Continue",
                distance: distToCurrentStep < 1 
                  ? `${Math.round(distToCurrentStep * 1000)} m`
                  : `${distToCurrentStep.toFixed(1)} km`,
                icon: getInstructionIcon(currentStep.maneuver?.type || "straight")
              });
              
              // Update next instruction
              if (currentIdx + 1 < steps.length) {
                const nextStep = steps[currentIdx + 1];
                setNextInstruction({
                  direction: nextStep.maneuver?.type || "straight",
                  text: nextStep.maneuver?.instruction || "Continue",
                  distance: "Then",
                  icon: getInstructionIcon(nextStep.maneuver?.type || "straight")
                });
              }
            }
          }
        },
        (error) => {
          console.warn('Error getting GPS data:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 5000
        }
      );
      setWatchId(id);
      
      return () => {
        navigator.geolocation.clearWatch(id);
      };
    }
  }, [destination, routes, selectedRoute, currentStepIndex]);

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