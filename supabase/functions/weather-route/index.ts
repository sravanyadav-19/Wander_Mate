import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startLat, startLng, endLat, endLng } = await req.json();

    // For MVP, return mock weather data
    // In production, integrate with OpenWeatherMap API
    const weatherData = {
      current: {
        temp: 22,
        condition: "Partly Cloudy",
        icon: "partly-cloudy",
        humidity: 65,
        windSpeed: 10
      },
      route: [
        { 
          location: "Start", 
          temp: 22, 
          condition: "Partly Cloudy",
          time: "Now"
        },
        { 
          location: "Midpoint", 
          temp: 24, 
          condition: "Sunny",
          time: "In 30 min"
        },
        { 
          location: "Destination", 
          temp: 21, 
          condition: "Clear",
          time: "In 1 hour"
        }
      ],
      alerts: [],
      recommendation: "Perfect weather for your journey! Light jacket recommended for the destination."
    };

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in weather-route function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});