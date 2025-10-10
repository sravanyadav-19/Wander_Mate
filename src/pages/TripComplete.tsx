import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SocialShareButton } from "@/components/social/SocialShareButton";
import { 
  CheckCircle,
  Camera,
  Star,
  MapPin,
  Clock,
  Home,
  Navigation
} from "lucide-react";

const TripComplete = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [tripTitle, setTripTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Get trip data from navigation state or session storage
  const [tripData, setTripData] = useState<any>(null);

  useEffect(() => {
    const stateData = location.state;
    const sessionData = sessionStorage.getItem('completed_trip');
    
    if (stateData?.tripData) {
      setTripData(stateData.tripData);
    } else if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        setTripData(parsed);
      } catch (e) {
        console.error('Error parsing session trip data:', e);
      }
    } else {
      // Generate default data based on session navigation data
      const navData = sessionStorage.getItem('nav_destination');
      if (navData) {
        try {
          const parsed = JSON.parse(navData);
          setTripData({
            id: tripId,
            startLocation: "Your starting point",
            endLocation: parsed.destinationName || "Destination",
            distance: "0 km", // Would be calculated during navigation
            duration: "0 min",
            route: "Completed Route",
            startTime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            endTime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            date: new Date().toLocaleDateString()
          });
        } catch (e) {
          console.error('Error parsing navigation data:', e);
        }
      }
    }
  }, [location.state, tripId]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPhotos(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const saveTrip = async () => {
    if (!user) {
      toast.error("Please sign in to save your trip");
      return;
    }

    if (!tripData) {
      toast.error("Trip data not available");
      return;
    }

    setIsSaving(true);
    try {
      // Use numeric values from tripData or parse from strings
      const distanceValue = tripData.distanceValue || parseFloat(tripData.distance) || 0;
      const durationValue = tripData.durationValue || parseInt(tripData.duration) || 0;

      // Save trip to database
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          title: tripTitle || `Trip to ${tripData.endLocation}`,
          description: notes,
          start_location: tripData.startLocation,
          end_location: tripData.endLocation,
          distance: distanceValue,
          duration: durationValue,
          status: 'completed',
          started_at: tripData.startedAt || new Date(Date.now() - durationValue * 60 * 1000).toISOString(),
          completed_at: new Date().toISOString(),
          route_data: {
            route: tripData.route,
            rating: rating
          }
        })
        .select()
        .single();

      if (tripError) throw tripError;

      // Save photos if any
      if (photos.length > 0 && trip) {
        const photoPromises = photos.map(async (photo, index) => {
          // In production, upload to Supabase Storage
          return supabase
            .from('trip_photos')
            .insert({
              trip_id: trip.id,
              user_id: user.id,
              photo_url: photo, // In production, this would be the storage URL
              caption: `Photo ${index + 1}`
            });
        });

        await Promise.all(photoPromises);
      }

      toast.success("Trip saved successfully!");
      // Clear session data
      sessionStorage.removeItem('completed_trip');
      sessionStorage.removeItem('nav_destination');
      navigate("/history");
    } catch (error) {
      console.error('Error saving trip:', error);
      toast.error("Failed to save trip");
    } finally {
      setIsSaving(false);
    }
  };

  const shareTrip = () => {
    if (!tripData) return null;

    const shareData = {
      title: `My trip to ${tripData.endLocation}`,
      text: `Just completed a ${tripData.distance} journey in ${tripData.duration}! 🗺️✨`,
      url: window.location.href,
    };

    return (
      <SocialShareButton 
        data={shareData}
        variant="outline"
        className="flex-1"
        showLabel={true}
      />
    );
  };

  if (!tripData) {
    return (
      <AppLayout showBottomNav={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No trip data available</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBottomNav={false}>
      <div className="flex flex-col min-h-screen">
        {/* Success Header */}
        <header className="gradient-hero text-white px-4 py-8 text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Trip Completed!</h1>
          <p className="text-white/80">Great job on your journey</p>
        </header>

        <div className="flex-1 px-4 py-6 space-y-6">
          {/* Trip Summary */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Trip Summary</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <MapPin className="h-5 w-5 text-primary mx-auto mb-1" />
                  <div className="text-2xl font-bold">{tripData.distance}</div>
                  <div className="text-sm text-muted-foreground">Distance</div>
                </div>
                <div className="text-center">
                  <Clock className="h-5 w-5 text-secondary mx-auto mb-1" />
                  <div className="text-2xl font-bold">{tripData.duration}</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From:</span>
                  <span>{tripData.startLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span>{tripData.endLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route:</span>
                  <span>{tripData.route}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span>{tripData.startTime} - {tripData.endTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Trip Title (Optional)</label>
            <Input
              placeholder={`Trip to ${tripData.endLocation}`}
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-3">Rate Your Experience</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleRatingClick(value)}
                  className="p-1"
                >
                  <Star 
                    className={`h-8 w-8 ${
                      value <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium mb-3">Add Photos</label>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-20 border-dashed"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Camera className="h-6 w-6 mr-2" />
                Add Photos
              </Button>
              <input
                id="photo-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Trip photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes & Memories</label>
            <Textarea
              placeholder="Share your thoughts about this trip..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 space-y-3">
          <div className="flex gap-3">
            {shareTrip()}
            <Button 
              className="flex-1"
              onClick={saveTrip}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Trip"}
            </Button>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate("/")}
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate("/search")}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Plan Next Trip
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TripComplete;