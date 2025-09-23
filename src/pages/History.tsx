import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar, MapPin, Clock, Camera, Filter, Search as SearchIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalTrips: 0,
    totalDistance: 0,
    totalTime: 0,
    totalPhotos: 0
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      
      // Fetch trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false });

      if (tripsError) throw tripsError;

      // Fetch photos count for each trip
      const tripsWithPhotos = await Promise.all(
        (tripsData || []).map(async (trip) => {
          const { count } = await supabase
            .from('trip_photos')
            .select('*', { count: 'exact', head: true })
            .eq('trip_id', trip.id);

          return {
            ...trip,
            photos: count || 0,
            rating: 5, // Default rating since we don't have this field yet
            completedAt: new Date(trip.completed_at || trip.created_at)
          };
        })
      );

      setTrips(tripsWithPhotos);

      // Calculate stats
      const stats = {
        totalTrips: tripsWithPhotos.length,
        totalDistance: tripsWithPhotos.reduce((sum, trip) => sum + (Number(trip.distance) || 0), 0),
        totalTime: tripsWithPhotos.reduce((sum, trip) => sum + (trip.duration || 0), 0),
        totalPhotos: tripsWithPhotos.reduce((sum, trip) => sum + trip.photos, 0)
      };
      setTotalStats(stats);

    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Error",
        description: "Failed to load your travel history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: "all", label: "All Trips" },
    { id: "recent", label: "Recent" },
    { id: "favorites", label: "Favorites" },
    { id: "long", label: "Long Distance" }
  ];

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-background border-b border-border px-4 py-4">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Travel History</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{totalStats.totalTrips}</p>
                  <p className="text-xs text-muted-foreground">Total Trips</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-secondary">{totalStats.totalDistance.toFixed(1)} km</p>
                  <p className="text-xs text-muted-foreground">Distance</p>
                </CardContent>
              </Card>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
              <Input
                placeholder="Search your trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.id)}
                  className="whitespace-nowrap"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {/* Trip List */}
        <div className="flex-1 px-4 py-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your travel history...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-4">Start exploring to build your travel history!</p>
              <Button>Plan Your First Trip</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <Card 
                  key={trip.id} 
                  className="cursor-pointer transition-smooth hover:shadow-elegant"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{trip.title || 'Untitled Trip'}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(trip.completedAt, "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {"★".repeat(trip.rating)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Route */}
                      {(trip.start_location || trip.end_location) && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {trip.start_location || 'Unknown'} → {trip.end_location || 'Unknown'}
                          </span>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {trip.distance && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{Number(trip.distance).toFixed(1)} km</span>
                          </div>
                        )}
                        {trip.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{trip.duration} min</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Camera className="h-3 w-3" />
                          <span>{trip.photos} photos</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end pt-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default History;