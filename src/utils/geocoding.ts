// Geocoding utility to convert place names to coordinates
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    // Use OpenStreetMap Nominatim API (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
