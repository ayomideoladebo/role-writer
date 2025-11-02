import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mic, RefreshCw, Crown } from "lucide-react";

interface BrandVoiceSettingsProps {
  brandVoice: string | null;
  isPremium: boolean;
  onUpdate: () => void;
}

export default function BrandVoiceSettings({ brandVoice, isPremium, onUpdate }: BrandVoiceSettingsProps) {
  const [voice, setVoice] = useState(brandVoice || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!isPremium) {
      toast.error("Brand voice customization is a premium feature");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("profiles")
        .update({ brand_voice: voice })
        .eq("id", user!.id);

      if (error) throw error;

      toast.success("Brand voice updated successfully");
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to update brand voice");
    } finally {
      setSaving(false);
    }
  };

  if (!isPremium) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6 pb-6 text-center">
          <Mic className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Brand Voice Customization</h3>
          <p className="text-muted-foreground mb-4">
            Define your unique tone and style for consistent content
          </p>
          <Button onClick={() => toast.info("Upgrade to Premium to customize your brand voice")}>
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Brand Voice
              <Badge variant="secondary">Premium</Badge>
            </CardTitle>
            <CardDescription>
              Define your unique tone, style, and personality for AI-generated content
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Example: I write in a conversational yet professional tone. I use storytelling, real-world examples, and actionable insights. I avoid jargon and keep things relatable..."
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          rows={6}
          className="resize-none"
        />
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Brand Voice"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
