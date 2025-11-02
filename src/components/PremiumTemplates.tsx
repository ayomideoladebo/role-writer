import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  isPremium: boolean;
  content: string;
}

interface PremiumTemplatesProps {
  isPremium: boolean;
  onSelectTemplate: (template: string) => void;
}

const templates: Template[] = [
  {
    id: "1",
    name: "Thought Leadership",
    description: "Share industry insights and perspectives",
    category: "Leadership",
    isPremium: false,
    content: "I've been thinking about [topic]...\n\nHere are 3 key insights:\n1. [insight]\n2. [insight]\n3. [insight]\n\nWhat's your take?"
  },
  {
    id: "2",
    name: "Case Study",
    description: "Showcase results and learnings",
    category: "Business",
    isPremium: false,
    content: "Challenge: [problem]\nSolution: [approach]\nResults: [outcomes]\n\nKey Takeaway: [lesson]"
  },
  {
    id: "3",
    name: "Quick Tips",
    description: "Share actionable advice",
    category: "Education",
    isPremium: false,
    content: "5 Quick Tips for [topic]:\n\n1. [tip]\n2. [tip]\n3. [tip]\n4. [tip]\n5. [tip]\n\nWhich one resonates most?"
  },
  {
    id: "4",
    name: "Personal Story",
    description: "Connect through authentic experiences",
    category: "Storytelling",
    isPremium: true,
    content: "[year] ago, I [situation].\n\nHere's what happened:\n[story]\n\nThe lesson? [key takeaway]\n\nHave you experienced something similar?"
  },
  {
    id: "5",
    name: "Trend Analysis",
    description: "Analyze industry trends and predictions",
    category: "Leadership",
    isPremium: true,
    content: "3 Trends Shaping [industry] in [year]:\n\n📊 Trend #1: [trend]\n→ Why it matters: [reason]\n\n📊 Trend #2: [trend]\n→ Why it matters: [reason]\n\n📊 Trend #3: [trend]\n→ Why it matters: [reason]\n\nHow are you adapting?"
  },
  {
    id: "6",
    name: "Controversial Take",
    description: "Challenge common assumptions",
    category: "Engagement",
    isPremium: true,
    content: "Unpopular opinion:\n[controversial statement]\n\nHere's why I believe this:\n\n[argument 1]\n[argument 2]\n[argument 3]\n\nAgree or disagree?"
  },
  {
    id: "7",
    name: "Behind The Scenes",
    description: "Show the process, not just results",
    category: "Storytelling",
    isPremium: true,
    content: "Most people see [end result].\n\nBut here's what actually happened behind the scenes:\n\n✗ [failure/challenge]\n✗ [failure/challenge]\n✓ [breakthrough]\n✓ [success]\n\nReality: [honest takeaway]"
  },
  {
    id: "8",
    name: "Comparison Post",
    description: "Compare approaches or tools",
    category: "Education",
    isPremium: true,
    content: "[Option A] vs [Option B]\n\n[Option A]:\n✓ [pro]\n✓ [pro]\n✗ [con]\n\n[Option B]:\n✓ [pro]\n✓ [pro]\n✗ [con]\n\nBest for: [recommendation]"
  },
];

export default function PremiumTemplates({ isPremium, onSelectTemplate }: PremiumTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "Leadership", "Business", "Education", "Storytelling", "Engagement"];
  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template: Template) => {
    if (template.isPremium && !isPremium) {
      toast.error("This is a premium template. Upgrade to access.");
      return;
    }
    onSelectTemplate(template.content);
    toast.success(`Template "${template.name}" applied`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Content Templates
              {isPremium && <Badge variant="secondary">Premium</Badge>}
            </CardTitle>
            <CardDescription>
              Pre-made templates to kickstart your content
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {filteredTemplates.map(template => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  template.isPremium && !isPremium ? 'opacity-60' : ''
                }`}
                onClick={() => handleSelectTemplate(template)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{template.name}</h4>
                        {template.isPremium && (
                          <Badge variant="secondary" className="text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {!isPremium && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Unlock {templates.filter(t => t.isPremium).length} premium templates
            </p>
            <Button 
              className="w-full" 
              onClick={() => toast.info("Upgrade to Premium to unlock all templates")}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
