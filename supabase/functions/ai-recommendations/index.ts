import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, preferences = [], category = 'all' } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get user info from auth header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabaseClient.auth.setSession({
        access_token: authHeader.replace('Bearer ', ''),
        refresh_token: '',
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Generate AI-powered recommendations
    const prompt = `Generate personalized travel recommendations for someone in ${location}. 
    User preferences: ${preferences.join(', ')}.
    Category filter: ${category}.
    
    Return 5-8 specific, real places with the following JSON format:
    {
      "recommendations": [
        {
          "name": "Place Name",
          "category": "restaurants|attractions|entertainment|shopping|parks|coffee",
          "description": "Brief, engaging description",
          "rating": 4.5,
          "estimatedTime": "15 min",
          "tags": ["tag1", "tag2", "tag3"],
          "aiReason": "Why this matches user preferences"
        }
      ]
    }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a local travel expert providing personalized recommendations.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let recommendations;
    try {
      recommendations = JSON.parse(content);
    } catch {
      // Fallback if JSON parsing fails
      recommendations = {
        recommendations: [
          {
            name: "Local Discovery",
            category: "attractions",
            description: "AI-curated recommendation based on your preferences",
            rating: 4.5,
            estimatedTime: "20 min",
            tags: ["AI-Powered", "Personalized"],
            aiReason: "Customized for your travel style"
          }
        ]
      };
    }

    console.log('Generated recommendations:', recommendations);

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-recommendations function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      recommendations: { recommendations: [] }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});