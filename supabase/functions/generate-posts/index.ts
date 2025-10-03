import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, regenerate, platform, topic, idea } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    console.log("Generating posts for user:", user.id);
    console.log("Topic:", topic);
    console.log("Idea:", idea);

    // Generate posts based on profile and user input
    const systemPrompt = `You are an expert social media content writer. Generate engaging, professional posts based on the user's profile and their specific topic.

Role: ${profile?.role || "Professional"}
Industry: ${profile?.industry || "General"}
Tone: ${profile?.tone_preference || "professional"}

Create authentic, value-driven content that sounds natural and human. Avoid buzzwords and clichés.`;

    const platforms = regenerate ? [platform] : ["linkedin", "twitter"];
    const generatedPosts = [];

    for (const plat of platforms) {
      let prompt = `Write about this topic: "${topic}"`;
      
      if (idea) {
        prompt += `\n\nUser's ideas/direction: ${idea}`;
      }
      
      if (plat === "linkedin") {
        prompt += "\n\nFormat: Write a 150-200 word LinkedIn post that provides value, insights, or thought leadership. Use 2-3 relevant hashtags. Make it engaging and professional.";
      } else {
        prompt += "\n\nFormat: Write a concise, impactful Twitter post (max 280 characters) that sparks engagement. Include 1-2 relevant hashtags.";
      }

      console.log(`Generating ${plat} post...`);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a moment.");
        }
        if (response.status === 402) {
          throw new Error("AI usage limit reached. Please add credits to your workspace.");
        }
        const errorText = await response.text();
        console.error("AI Gateway error:", response.status, errorText);
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      console.log(`Generated ${plat} post:`, content);

      // Store in database
      const { error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          platform: plat,
          content: content,
          is_saved: false,
        });

      if (insertError) {
        console.error("Error inserting post:", insertError);
        throw insertError;
      }

      generatedPosts.push({ platform: plat, content });
    }

    return new Response(
      JSON.stringify({ success: true, posts: generatedPosts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in generate-posts function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate posts" }),
      { 
        status: error.message.includes("Unauthorized") ? 401 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});