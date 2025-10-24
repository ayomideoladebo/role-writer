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

    // Creative camera angles and styles
    const cameraAngles = ['over-the-shoulder shot', 'side profile', 'realistic phone camera shoot style', 'slightly elevated angle', 'eye-level perspective'];
    const styles = ['realistic cinematic lighting with warm tones', ' realistic bright natural window light', 'realistic modern minimalist'];
    const randomAngle = cameraAngles[Math.floor(Math.random() * cameraAngles.length)];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];

    // Determine the image prompt and content based on post type
    let imagePrompt = '';
    let requestBody: any = {
      model: 'google/gemini-2.5-flash-image-preview',
      modalities: ['image', 'text']
    };
    
    if (postType === 'story' && avatarUrl) {
      // For story posts with avatar, edit the user's image into a workspace scene
      imagePrompt = `Transform this person's photo into a professional workspace realistic scene. Place them working at a clean, modern desk with a laptop. Use ${randomAngle} camera angle and ${randomStyle}. The scene should show focused work, with good composition and looking very realistic. Keep their face details and likeness intact. Background: minimal workspace with natural lighting. Ultra high quality, iphone camera shoot.`;
      
      requestBody.messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: imagePrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: avatarUrl
              }
            }
          ]
        }
      ];
    } else if (postType === 'tips') {
      // For tips posts, generate illustrative/flyer-style image
      const contentSnippet = postContent.slice(0, 200);
      imagePrompt = `Create a modern, eye-catching social media flyer that illustrates: "${contentSnippet}". Use bold typography, clean layout, vibrant professional colors, and simple illustrations. Style: contemporary graphic design, flat design elements, minimalist. Camera angle: straight-on presentation view. Ultra high resolution, social media optimized.`;
      
      requestBody.messages = [
        {
          role: 'user',
          content: imagePrompt
        }
      ];
    } else {
      // Default professional image with creativity
      imagePrompt = `Create a striking professional image for a social media post. Use ${randomAngle} and ${randomStyle}. Incorporate abstract shapes, smooth gradients, or minimal geometric patterns with a sophisticated color palette. Style: modern, bold, eye-catching. Ultra high resolution.`;
      
      requestBody.messages = [
        {
          role: 'user',
          content: imagePrompt
        }
      ];
    }

    console.log('Generating image with prompt:', imagePrompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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