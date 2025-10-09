import { useState, useEffect } from 'react';

interface RouteOption {
  id: number;
  type: string;
  icon: JSX.Element;
  name: string;
  duration: string;
  distance: string;
  traffic: string;
  description: string;
  highlights: string[];
  color: string;
  bgColor: string;
}

export const useRouteCalculation = (
  startLat: number | null,
  startLng: number | null,
  endLat: number | null,
  endLng: number | null
) => {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!startLat || !startLng || !endLat || !endLng) return;

    const calculateRoutes = () => {
      setIsCalculating(true);

      // Calculate distance using Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = ((endLat - startLat) * Math.PI) / 180;
      const dLng = ((endLng - startLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((startLat * Math.PI) / 180) *
          Math.cos((endLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      // Estimate travel time (assuming average speed of 40 km/h in city)
      const baseTime = (distance / 40) * 60; // in minutes

      const calculatedRoutes = [
        {
          id: 0,
          type: "fastest",
          icon: null as any, // Will be set by component
          name: "Fastest Route",
          duration: `${Math.round(baseTime)} min`,
          distance: `${distance.toFixed(1)} km`,
          traffic: distance < 5 ? "Light traffic" : "Moderate traffic",
          description: "Main roads with minimal stops",
          highlights: ["Direct path", "Good road conditions"],
          color: "text-blue-600",
          bgColor: "bg-blue-50 border-blue-200"
        },
        {
          id: 1,
          type: "scenic",
          icon: null as any,
          name: "Scenic Route",
          duration: `${Math.round(baseTime * 1.3)} min`,
          distance: `${(distance * 1.15).toFixed(1)} km`,
          traffic: distance < 5 ? "Light traffic" : "Moderate traffic",
          description: "Beautiful views along the way",
          highlights: ["Scenic views", "Photo opportunities", "Quiet roads"],
          color: "text-green-600",
          bgColor: "bg-green-50 border-green-200"
        },
        {
          id: 2,
          type: "recommended",
          icon: null as any,
          name: "Local's Choice",
          duration: `${Math.round(baseTime * 1.1)} min`,
          distance: `${(distance * 1.08).toFixed(1)} km`,
          traffic: distance < 5 ? "Light traffic" : "Moderate traffic",
          description: "Discover hidden gems along the way",
          highlights: ["Local attractions", "Less crowded", "Interesting stops"],
          color: "text-orange-600",
          bgColor: "bg-orange-50 border-orange-200"
        }
      ];

      setRoutes(calculatedRoutes);
      setIsCalculating(false);
    };

    calculateRoutes();
  }, [startLat, startLng, endLat, endLng]);

  return { routes, isCalculating };
};
