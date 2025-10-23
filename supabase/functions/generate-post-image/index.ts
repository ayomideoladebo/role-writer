import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postContent, postType, avatarUrl } = await req.json();

    if (!postContent) {
      return new Response(
        JSON.stringify({ error: 'Post content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Determine the image prompt based on post type
    let imagePrompt = '';
    
    if (postType === 'story' && avatarUrl) {
      // For story posts with avatar, generate workspace image
      imagePrompt = `Create a professional, high-quality image of a person working at a clean, modern workspace. The scene should show a simple setup with a laptop on a wooden or white desk, good natural lighting, and a minimalist aesthetic. The person should appear focused and professional. Style: realistic, warm lighting, shallow depth of field. Ultra high resolution.`;
    } else if (postType === 'tips') {
      // For tips posts, generate illustrative/flyer-style image
      const contentSnippet = postContent.slice(0, 200);
      imagePrompt = `Create a modern, eye-catching social media flyer design that illustrates this content: "${contentSnippet}". Use bold typography, clean layout, professional color scheme, and simple icons or illustrations. Style: flat design, modern, minimalist. Ultra high resolution.`;
    } else {
      // Default professional image
      imagePrompt = `Create a clean, modern professional image suitable for a LinkedIn or Twitter post. Use abstract shapes, gradients, or minimal geometric patterns with a professional color palette. Style: modern, clean, professional. Ultra high resolution.`;
    }

    console.log('Generating image with prompt:', imagePrompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: imagePrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-post-image function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});