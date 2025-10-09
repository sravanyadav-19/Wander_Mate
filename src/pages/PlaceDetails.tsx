import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/layout/AppLayout";
import { SocialShareButton } from "@/components/social/SocialShareButton";
import { usePlaceDetails } from "@/hooks/usePlaceDetails";
import { 
  ArrowLeft,
  MapPin, 
  Star, 
  Clock, 
  Phone,
  Globe,
  Navigation,
  Heart,
  Camera,
  Calendar
} from "lucide-react";

const PlaceDetails = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const { place, isLoading } = usePlaceDetails(placeId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading place details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!place) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">Place not found</p>
            <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-2"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <SocialShareButton 
                data={{
                  title: place.name,
                  text: `Check out this amazing place: ${place.name}! ${place.description.slice(0, 100)}...`,
                  url: window.location.href
                }}
                variant="ghost"
                size="sm"
                showLabel={false}
              />
            </div>
          </div>
        </header>

        <div className="flex-1">
          {/* Hero Section */}
          <div className="relative h-48 gradient-hero flex items-center justify-center">
            <div className="grid grid-cols-4 gap-2 text-4xl">
              {place.images.map((emoji, index) => (
                <div key={index} className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  {emoji}
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 py-6 space-y-6">
            {/* Basic Info */}
            <section>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{place.name}</h1>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{place.rating}</span>
                      <span className="text-muted-foreground">({place.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{place.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{place.estimatedTime}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {place.category}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {place.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {place.description}
              </p>
            </section>

            <Separator />

            {/* Contact Info */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{place.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{place.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{place.website}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm">
                    <div>Today: {place.openingHours.today}</div>
                    <div className="text-muted-foreground">Tomorrow: {place.openingHours.tomorrow}</div>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Highlights */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Highlights</h2>
              <ul className="space-y-2">
                {place.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>

            <Separator />

            {/* Reviews */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Recent Reviews</h2>
              <div className="space-y-4">
                {place.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{review.user}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate(`/plan-trip?destination=${place.name}`)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add to Trip
            </Button>
            <Button 
              className="flex-1"
              onClick={() => navigate(`/route/${place.id}`)}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PlaceDetails;