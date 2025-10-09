import { useState, useEffect } from 'react';

interface PlaceDetails {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  distance: string;
  estimatedTime: string;
  address: string;
  phone: string;
  website: string;
  openingHours: {
    today: string;
    tomorrow: string;
  };
  images: string[];
  tags: string[];
  highlights: string[];
  reviews: Array<{
    id: number;
    user: string;
    rating: number;
    text: string;
    date: string;
  }>;
}

export const usePlaceDetails = (placeId: string | undefined) => {
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      setIsLoading(true);
      
      try {
        // In production, this would fetch from a real API or database
        // For now, generate dynamic placeholder data based on placeId
        const placeName = `Place ${placeId}`;
        
        const generatedPlace: PlaceDetails = {
          id: placeId || '1',
          name: placeName,
          category: "attraction",
          description: `An interesting destination worth visiting. This place offers unique experiences and is popular among travelers.`,
          rating: 4.5 + Math.random() * 0.5,
          reviewCount: Math.floor(Math.random() * 10000) + 500,
          distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
          estimatedTime: `${Math.floor(Math.random() * 30 + 5)} min`,
          address: `Location address for ${placeName}`,
          phone: "+1 (555) 000-0000",
          website: "website.com",
          openingHours: {
            today: "9:00 AM - 6:00 PM",
            tomorrow: "9:00 AM - 6:00 PM"
          },
          images: ["🏛️", "🌿", "📸", "🎨"],
          tags: ["Popular", "Family-friendly", "Photo spot"],
          highlights: [
            "Great for photos",
            "Accessible location",
            "Nearby amenities",
            "Good reviews"
          ],
          reviews: [
            {
              id: 1,
              user: "Travel Enthusiast",
              rating: 5,
              text: "Amazing place! Highly recommended for anyone visiting the area.",
              date: `${Math.floor(Math.random() * 7)} days ago`
            },
            {
              id: 2,
              user: "Local Guide",
              rating: 4,
              text: "Nice spot, can get crowded during peak hours but worth the visit.",
              date: `${Math.floor(Math.random() * 14)} days ago`
            }
          ]
        };
        
        setPlace(generatedPlace);
      } catch (error) {
        console.error('Error fetching place details:', error);
        setPlace(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (placeId) {
      fetchPlaceDetails();
    }
  }, [placeId]);

  return { place, isLoading };
};
