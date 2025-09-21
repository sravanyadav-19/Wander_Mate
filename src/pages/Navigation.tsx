import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
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
  const [isNavigating, setIsNavigating] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(35);
  const [eta, setEta] = useState("12 min");
  const [distanceRemaining, setDistanceRemaining] = useState("2.3 km");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showStops, setShowStops] = useState(false);

  // Mock navigation data
  const currentInstruction = {
    direction: "right",
    text: "Turn right onto Brooklyn Bridge",
    distance: "In 200 m",
    icon: <ArrowRight className="h-6 w-6" />
  };

  const nextInstruction = {
    direction: "straight",
    text: "Continue straight for 1.2 km",
    distance: "Then",
    icon: <ArrowUp className="h-5 w-5" />
  };

  const quickStops = [
    { name: "Starbucks", type: "Coffee", distance: "0.1 km", eta: "+3 min" },
    { name: "Gas Station", type: "Fuel", distance: "0.3 km", eta: "+5 min" },
    { name: "McDonald's", type: "Food", distance: "0.5 km", eta: "+7 min" }
  ];

  useEffect(() => {
    // Simulate navigation updates
    const interval = setInterval(() => {
      setCurrentSpeed(Math.floor(Math.random() * 20) + 25);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
        <div className="flex-1 relative bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          {/* Mock Map */}
          <div className="text-center">
            <NavigationIcon className="h-24 w-24 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">Live Map Navigation</p>
            <p className="text-white/40 text-sm">Route visualization would appear here</p>
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