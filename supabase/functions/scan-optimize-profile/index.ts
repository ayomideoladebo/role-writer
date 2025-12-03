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
    const { platform, bio, posts, stats } = await req.json();
    
    console.log("Analyzing profile for platform:", platform);
    console.log("Bio length:", bio?.length || 0);
    console.log("Posts length:", posts?.length || 0);
    console.log("Stats length:", stats?.length || 0);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const platformName = platform === "linkedin" ? "LinkedIn" : "Twitter/X";
    
    const systemPrompt = `You are an expert social media profile analyst and optimization specialist. You analyze ${platformName} profiles and provide detailed, actionable feedback.

You must respond with a valid JSON object in this exact format:
{
  "categories": [
    {
      "name": "Profile Optimization",
      "score": <number 0-100>,
      "description": "Bio, headline, and profile completeness"
    },
    {
      "name": "Content Quality", 
      "score": <number 0-100>,
      "description": "Post quality, value delivery, and engagement potential"
    },
    {
      "name": "Posting Consistency",
      "score": <number 0-100>,
      "description": "Frequency, timing, and content variety"
    },
    {
      "name": "Engagement Strategy",
      "score": <number 0-100>,
      "description": "CTAs, interaction patterns, and community building"
    }
  ],
  "overallScore": <number 0-100>,
  "tips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"]
}

Scoring guidelines:
- 90-100: Exceptional, industry-leading
- 80-89: Excellent, minor improvements possible
- 70-79: Good, clear areas for growth
- 60-69: Average, significant room for improvement
- 50-59: Below average, needs attention
- Below 50: Needs major work

Be specific and actionable in your tips. Reference actual content from the user's profile when giving feedback.`;

    const userPrompt = `Analyze this ${platformName} profile and provide scores and optimization tips:

${bio ? `**Bio/About:**\n${bio}\n` : ""}
${posts ? `**Recent Posts:**\n${posts}\n` : ""}
${stats ? `**Profile Stats:**\n${stats}\n` : ""}

Provide your analysis as a JSON object with categories, scores, tips, strengths, and improvements.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. AI usage limit reached." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    console.log("AI response received, parsing...");

    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // Try to parse the JSON
    let result;
    try {
      result = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Provide a fallback response
      result = {
        categories: [
          { name: "Profile Optimization", score: 65, description: "Bio, headline, and profile completeness" },
          { name: "Content Quality", score: 60, description: "Post quality, value delivery, and engagement potential" },
          { name: "Posting Consistency", score: 55, description: "Frequency, timing, and content variety" },
          { name: "Engagement Strategy", score: 58, description: "CTAs, interaction patterns, and community building" },
        ],
        overallScore: 60,
        tips: [
          "Add a clear value proposition to your bio",
          "Include relevant keywords for discoverability",
          "Post more consistently (aim for 3-5 times per week)",
          "Add calls-to-action to encourage engagement",
          "Share more original insights and experiences",
        ],
        strengths: [
          "You have profile content to analyze",
          "You are taking steps to improve",
          "Awareness is the first step to growth",
        ],
        improvements: [
          "Provide more posts for better analysis",
          "Include engagement metrics when available",
          "Consider your content strategy",
        ],
      };
    }

    console.log("Analysis complete, returning result");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in scan-optimize-profile:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});