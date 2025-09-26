import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isNavigating, setIsNavigating] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [eta, setEta] = useState("4 hr 15 min");
  const [distanceRemaining, setDistanceRemaining] = useState("312 km");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showStops, setShowStops] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Navigation data for Vijayawada route
  const currentInstruction = {
    direction: "straight",
    text: "Continue on NH-16 toward Vijayawada",
    distance: "In 2.5 km",
    icon: <ArrowUp className="h-6 w-6" />
  };

  const nextInstruction = {
    direction: "right",
    text: "Take exit toward Vijayawada City Center",
    distance: "Then",
    icon: <ArrowRight className="h-5 w-5" />
  };

  const quickStops = [
    { name: "HP Petrol Pump", type: "Fuel", distance: "1.2 km", eta: "+5 min" },
    { name: "Café Coffee Day", type: "Coffee", distance: "2.1 km", eta: "+8 min" },
    { name: "Reliance Fresh", type: "Food", distance: "3.5 km", eta: "+12 min" }
  ];

  useEffect(() => {
    // Initialize map
    if (!mapContainer.current) return;

    // You'll need to add your Mapbox token here
    // For now, we'll show a placeholder until token is added
    const MAPBOX_TOKEN = 'YOUR_MAPBOX_TOKEN';
    
    if (MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN') {
      // Show placeholder until token is configured
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-day-v1',
      center: [80.6480, 16.5062], // Vijayawada coordinates  
      zoom: 12,
      pitch: 45,
      bearing: 0
    });

    // Add route line (mock route to Vijayawada)
    map.current.on('load', () => {
      if (!map.current) return;
      
      map.current.addSource('route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': [
              [80.6480, 16.5062], // Start point
              [80.6520, 16.5100], // Sample route points
              [80.6580, 16.5150],
              [80.6620, 16.5200]
            ]
          }
        }
      });

      map.current.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#3b82f6',
          'line-width': 8
        }
      });
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    // Get real GPS speed data
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const speed = position.coords.speed;
          if (speed !== null) {
            // Convert m/s to km/h
            const speedKmh = Math.round(speed * 3.6);
            setCurrentSpeed(speedKmh);
          }
        },
        (error) => {
          console.warn('Error getting GPS speed:', error);
          // Fallback to simulated speed for demo
          setCurrentSpeed(Math.floor(Math.random() * 20) + 45);
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
  }, [watchId]);

  const endNavigation = () => {
    setIsNavigating(false);
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
          <div ref={mapContainer} className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
          
          {/* Fallback when no Mapbox token */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-white/60">
              <NavigationIcon className="h-24 w-24 mx-auto mb-4 opacity-30" />
              <p className="mb-2">Live Navigation to Vijayawada</p>
              <p className="text-sm opacity-50">Add Mapbox token for full map functionality</p>
            </div>
          </div>

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

          {/* Quick Stops Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStops(!showStops)}
            className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
          >
            <Coffee className="h-4 w-4" />
          </Button>
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