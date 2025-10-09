import { useState, useEffect } from 'react';

interface POI {
  name: string;
  type: string;
  distance: string;
}

export const usePOI = (lat: number | null, lng: number | null, locationName: string) => {
  const [pointsOfInterest, setPointsOfInterest] = useState<POI[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;

    const fetchPOIs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );
        const locationData = await response.json();
        const city = locationData.city || locationData.locality || locationName || 'area';

        // Generate location-based POIs
        const pois: POI[] = [
          { 
            name: `${city} Park`, 
            type: "Park", 
            distance: `${(Math.random() * 2 + 0.3).toFixed(1)} km from route` 
          },
          { 
            name: `Coffee Shop in ${city}`, 
            type: "Coffee", 
            distance: `${(Math.random() * 1 + 0.1).toFixed(1)} km from route` 
          },
          { 
            name: `${city} Attraction`, 
            type: "Attraction", 
            distance: `${(Math.random() * 3 + 0.5).toFixed(1)} km from route` 
          },
          { 
            name: `Local Restaurant`, 
            type: "Food", 
            distance: `${(Math.random() * 1.5 + 0.2).toFixed(1)} km from route` 
          }
        ];
        
        setPointsOfInterest(pois);
      } catch (error) {
        console.error('Error fetching POIs:', error);
        setPointsOfInterest([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPOIs();
  }, [lat, lng, locationName]);

  return { pointsOfInterest, isLoading };
};
