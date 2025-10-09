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

    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }

    // Fetch weather for start location
    const startWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${startLat}&lon=${startLng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    const startWeather = await startWeatherResponse.json();

    // Fetch weather for end location
    const endWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${endLat}&lon=${endLng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    const endWeather = await endWeatherResponse.json();

    // Calculate midpoint
    const midLat = (startLat + endLat) / 2;
    const midLng = (startLng + endLng) / 2;

    // Fetch weather for midpoint
    const midWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${midLat}&lon=${midLng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    const midWeather = await midWeatherResponse.json();

    // Check for weather alerts
    const alertsResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${startLat}&lon=${startLng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    const alertsData = await alertsResponse.json();

    const weatherData = {
      current: {
        temp: Math.round(startWeather.main.temp),
        condition: startWeather.weather[0].main,
        icon: startWeather.weather[0].icon,
        humidity: startWeather.main.humidity,
        windSpeed: Math.round(startWeather.wind.speed)
      },
      route: [
        { 
          location: "Start", 
          temp: Math.round(startWeather.main.temp), 
          condition: startWeather.weather[0].main,
          time: "Now"
        },
        { 
          location: "Midpoint", 
          temp: Math.round(midWeather.main.temp), 
          condition: midWeather.weather[0].main,
          time: "Midway"
        },
        { 
          location: "Destination", 
          temp: Math.round(endWeather.main.temp), 
          condition: endWeather.weather[0].main,
          time: "On arrival"
        }
      ],
      alerts: alertsData.alerts || [],
      recommendation: generateWeatherRecommendation(startWeather, endWeather)
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

function generateWeatherRecommendation(startWeather: any, endWeather: any): string {
  const startTemp = startWeather.main.temp;
  const endTemp = endWeather.main.temp;
  const tempDiff = Math.abs(endTemp - startTemp);
  
  let recommendation = "";
  
  if (tempDiff > 5) {
    if (endTemp < startTemp) {
      recommendation = `Temperature will drop by ${Math.round(tempDiff)}°C. Bring a jacket! `;
    } else {
      recommendation = `Temperature will rise by ${Math.round(tempDiff)}°C. Dress light! `;
    }
  }
  
  const startCondition = startWeather.weather[0].main.toLowerCase();
  const endCondition = endWeather.weather[0].main.toLowerCase();
  
  if (startCondition.includes('rain') || endCondition.includes('rain')) {
    recommendation += "Rain expected along route. Bring an umbrella. ";
  } else if (startCondition.includes('clear') && endCondition.includes('clear')) {
    recommendation += "Clear weather throughout your journey. Perfect for traveling! ";
  } else if (startCondition.includes('cloud')) {
    recommendation += "Cloudy conditions expected. ";
  }
  
  return recommendation || "Have a safe journey!";
}