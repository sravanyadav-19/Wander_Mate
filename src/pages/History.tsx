import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar, MapPin, Clock, Camera, Filter, Search as SearchIcon } from "lucide-react";
import { format } from "date-fns";

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock trip data
  const trips = [
    {
      id: 1,
      title: "Morning Run in Central Park",
      startLocation: "79th St & 5th Ave",
      endLocation: "Bethesda Fountain",
      distance: 3.2,
      duration: 45,
      completedAt: new Date("2024-01-15T08:30:00"),
      photos: 12,
      rating: 5
    },
    {
      id: 2,
      title: "Brooklyn Bridge Walk",
      startLocation: "Brooklyn Bridge Park",
      endLocation: "South Street Seaport",
      distance: 2.8,
      duration: 60,
      completedAt: new Date("2024-01-12T14:20:00"),
      photos: 24,
      rating: 4
    },
    {
      id: 3,
      title: "Times Square to High Line",
      startLocation: "Times Square",
      endLocation: "High Line Park",
      distance: 4.1,
      duration: 75,
      completedAt: new Date("2024-01-08T16:45:00"),
      photos: 18,
      rating: 5
    }
  ];

  const totalStats = {
    totalTrips: trips.length,
    totalDistance: trips.reduce((sum, trip) => sum + trip.distance, 0),
    totalTime: trips.reduce((sum, trip) => sum + trip.duration, 0),
    totalPhotos: trips.reduce((sum, trip) => sum + trip.photos, 0)
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
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search your trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
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
          {trips.length === 0 ? (
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
                        <CardTitle className="text-lg">{trip.title}</CardTitle>
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
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {trip.startLocation} → {trip.endLocation}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{trip.distance} km</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{trip.duration} min</span>
                        </div>
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