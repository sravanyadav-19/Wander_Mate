import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Camera, 
  Heart,
  Filter,
  Coffee,
  Utensils,
  ShoppingBag,
  Trees
} from "lucide-react";

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All", icon: MapPin },
    { id: "restaurants", label: "Food", icon: Utensils },
    { id: "attractions", label: "Attractions", icon: Camera },
    { id: "coffee", label: "Coffee", icon: Coffee },
    { id: "shopping", label: "Shopping", icon: ShoppingBag },
    { id: "parks", label: "Parks", icon: Trees }
  ];

  const places = [
    {
      id: 1,
      name: "The High Line",
      category: "attractions",
      description: "Elevated park built on former railway tracks",
      rating: 4.8,
      distance: "1.2 km",
      estimatedTime: "15 min",
      image: "🌿",
      tags: ["Park", "Walking", "Views"],
      isOpen: true
    },
    {
      id: 2,
      name: "Joe Coffee",
      category: "coffee",
      description: "Local favorite for artisanal coffee and pastries",
      rating: 4.6,
      distance: "0.8 km",
      estimatedTime: "10 min",
      image: "☕",
      tags: ["Coffee", "WiFi", "Quiet"],
      isOpen: true
    },
    {
      id: 3,
      name: "Chelsea Market",
      category: "shopping",
      description: "Indoor food hall and shopping destination",
      rating: 4.7,
      distance: "2.1 km",
      estimatedTime: "25 min",
      image: "🏪",
      tags: ["Food", "Shopping", "Indoor"],
      isOpen: true
    },
    {
      id: 4,
      name: "Brooklyn Bridge Park",
      category: "parks",
      description: "Waterfront park with stunning city views",
      rating: 4.9,
      distance: "3.5 km",
      estimatedTime: "35 min",
      image: "🌉",
      tags: ["Park", "Views", "Outdoor"],
      isOpen: true
    }
  ];

  const filteredPlaces = selectedCategory === "all" 
    ? places 
    : places.filter(place => place.category === selectedCategory);

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="gradient-hero text-white px-4 py-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">Discover</h1>
              <p className="text-white/80">Find amazing places near you</p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/95 border-0"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`whitespace-nowrap ${
                      selectedCategory === category.id 
                        ? "bg-white text-primary" 
                        : "bg-white/20 text-white border-white/30"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Places List */}
        <div className="flex-1 px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {selectedCategory === "all" ? "All Places" : categories.find(c => c.id === selectedCategory)?.label}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredPlaces.length} found
            </span>
          </div>

          <div className="space-y-4">
            {filteredPlaces.map((place) => (
              <Card key={place.id} className="cursor-pointer transition-smooth hover:shadow-elegant">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    {/* Place Image/Icon */}
                    <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center text-2xl">
                      {place.image}
                    </div>

                    {/* Place Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{place.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {place.description}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-2 p-1">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {place.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Stats and Action */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{place.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{place.distance}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{place.estimatedTime}</span>
                          </div>
                          {place.isOpen && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                              Open
                            </Badge>
                          )}
                        </div>

                        <Button size="sm">
                          Get Directions
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPlaces.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No places found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Discover;