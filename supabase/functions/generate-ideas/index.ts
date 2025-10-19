import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, mode = "normal" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating ideas for profile:", profile, "in mode:", mode);

    const systemPrompt = `You are a creative content strategist specializing in social media content for ${profile.industry} professionals.`;

    // Mode-specific instructions
    const modeInstructions: Record<string, string> = {
      normal: "Generate standard professional content ideas that are informative and engaging.",
      story: "Generate ideas that tell personal stories or experiences. Focus on narrative elements, lessons learned, and relatable moments that connect with the audience emotionally.",
      tips: "Generate practical tips and tricks that professionals in this field need to know. Focus on actionable advice, best practices, and insider knowledge.",
      fun: "Generate professionally casual content that's entertaining yet appropriate for professional networks. Include light humor, interesting facts, or engaging perspectives.",
      question: "Generate thought-provoking questions that spark discussions and engagement. Focus on industry trends, challenges, or philosophical aspects of the field.",
      list: "Generate listicle-style content ideas (e.g., '5 ways to...', 'Top 10...'). Make them specific, numbered, and easy to scan.",
      howto: "Generate step-by-step guide ideas that teach specific skills or processes. Focus on clear, actionable instructions.",
      mythbust: "Generate ideas that debunk common misconceptions or myths in the industry. Focus on correcting misinformation with facts and insights."
    };

    const modeInstruction = modeInstructions[mode] || modeInstructions.normal;

    const prompt = `Generate 5 diverse and engaging content ideas for a ${profile.role} in the ${profile.industry} industry. 
Each idea should be specific, actionable, and suitable for LinkedIn and Twitter posts with a ${profile.tone_preference} tone.

MODE: ${mode.toUpperCase()}
${modeInstruction}

Return ideas in this exact format for each:
Topic: [Concise topic title]
Ideas: [2-3 specific angles or points to cover]

Make each idea unique and valuable for the target audience.`;

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
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log("Generated ideas:", content);

    // Parse the ideas from the response
    const ideaBlocks = content.split("\n\n").filter((block: string) => block.trim());
    const parsedIdeas = ideaBlocks.map((block: string) => {
      const topicMatch = block.match(/Topic:\s*(.+)/);
      const ideasMatch = block.match(/Ideas:\s*(.+)/s);
      
      return {
        topic: topicMatch ? topicMatch[1].trim() : "",
        ideas: ideasMatch ? ideasMatch[1].trim() : "",
      };
    }).filter((idea: { topic: string; ideas: string }) => idea.topic && idea.ideas);

    return new Response(JSON.stringify({ ideas: parsedIdeas }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-ideas function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
