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
    const { platform, weakAreas, improvements, tips } = await req.json();
    
    console.log("Generating improvement posts for:", platform);
    console.log("Weak areas:", weakAreas);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const platformName = platform === "linkedin" ? "LinkedIn" : "Twitter/X";
    const platformGuidelines = platform === "linkedin" 
      ? "LinkedIn posts should be professional, value-driven, and typically 150-300 words. Use line breaks for readability. Include a strong hook and call-to-action."
      : "Twitter posts should be concise (under 280 characters or thread format), punchy, and engaging. Use hooks that stop the scroll.";
    
    const systemPrompt = `You are an expert ${platformName} content strategist. Generate highly engaging post ideas that specifically target weak areas in a user's profile.

${platformGuidelines}

You must respond with a valid JSON object containing exactly 5 post ideas in this format:
{
  "postIdeas": [
    {
      "title": "Brief title describing the post concept",
      "content": "The full post content ready to publish",
      "targetArea": "Which weak area this addresses",
      "platform": "${platform}"
    }
  ]
}

Make each post:
1. Actionable and immediately usable
2. Aligned with best practices for ${platformName}
3. Designed to boost engagement and profile optimization
4. Varied in format (story, tips, question, insight, etc.)
5. Authentic and human-sounding, not generic`;

    const weakAreasText = weakAreas.length > 0 
      ? `Weak areas to target: ${weakAreas.join(", ")}`
      : "Focus on general profile improvement";
    
    const improvementsText = improvements?.length > 0
      ? `Specific improvements needed: ${improvements.join("; ")}`
      : "";
    
    const tipsText = tips?.length > 0
      ? `Tips to incorporate: ${tips.slice(0, 3).join("; ")}`
      : "";

    const userPrompt = `Generate 5 ${platformName} post ideas to help improve this profile.

${weakAreasText}
${improvementsText}
${tipsText}

Create posts that will:
- Demonstrate expertise and thought leadership
- Encourage engagement and conversation
- Showcase personality while remaining professional
- Address the specific weak areas identified

Return as JSON with postIdeas array.`;

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

    // Extract JSON from the response
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    let result;
    try {
      result = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Provide fallback post ideas
      result = {
        postIdeas: [
          {
            title: "Share Your Journey",
            content: platform === "linkedin" 
              ? "3 years ago, I made a decision that changed everything.\n\nI stopped chasing perfection and started embracing progress.\n\nHere's what I learned:\n\n→ Small wins compound\n→ Consistency beats intensity\n→ Your network is your net worth\n\nWhat's one decision that changed your career? 👇"
              : "3 years ago I stopped chasing perfection.\n\nStarted embracing progress instead.\n\nBest decision ever. 🚀\n\nWhat's yours?",
            targetArea: "Content Quality",
            platform
          },
          {
            title: "Industry Insight",
            content: platform === "linkedin"
              ? "Unpopular opinion in our industry:\n\nThe best professionals aren't the ones with the most skills.\n\nThey're the ones who know which skills matter most.\n\nFocus beats breadth. Every time.\n\nAgree or disagree?"
              : "Hot take:\n\nThe best professionals don't have the most skills.\n\nThey know which skills matter most.\n\nFocus > breadth",
            targetArea: "Engagement Strategy",
            platform
          },
          {
            title: "Behind the Scenes",
            content: platform === "linkedin"
              ? "What my LinkedIn doesn't show you:\n\n❌ The 47 rejections before my first yes\n❌ The imposter syndrome that still creeps in\n❌ The late nights wondering if this is worth it\n\nSuccess isn't linear. Don't compare your chapter 1 to someone else's chapter 20.\n\nWho needed to hear this today?"
              : "What social media doesn't show:\n\n• 47 rejections before 1 yes\n• Imposter syndrome (still)\n• Late night doubts\n\nSuccess isn't linear. Keep going.",
            targetArea: "Profile Optimization",
            platform
          },
          {
            title: "Quick Tips List",
            content: platform === "linkedin"
              ? "5 things I wish I knew when I started:\n\n1. Done is better than perfect\n2. Relationships > transactions\n3. Your reputation is built in the small moments\n4. Ask for help early and often\n5. Document everything\n\nSave this for when you need a reminder. 📌"
              : "5 things I wish I knew earlier:\n\n1. Done > perfect\n2. Relationships > transactions\n3. Ask for help early\n4. Document everything\n5. Small moments matter",
            targetArea: "Posting Consistency",
            platform
          },
          {
            title: "Engagement Question",
            content: platform === "linkedin"
              ? "I'm curious about something...\n\nWhat's the ONE skill that's had the biggest impact on your career?\n\nFor me, it's communication.\n\nNot just presenting or writing. But truly listening and understanding what people need.\n\nDrop yours below 👇"
              : "What's the ONE skill that changed your career most?\n\nFor me: communication.\n\nNot just talking. Truly listening.\n\nYours? 👇",
            targetArea: "Engagement Strategy",
            platform
          }
        ]
      };
    }

    console.log("Post ideas generated successfully");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-improvement-posts:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});