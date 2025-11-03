import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import BrandVoiceSettings from "@/components/BrandVoiceSettings";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Sparkles } from "lucide-react";

interface Profile {
  subscription_tier: string;
  brand_voice: string | null;
}

export default function BrandVoice() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("subscription_tier, brand_voice")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleUpdate = () => {
    // Refetch profile after update
    const refetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("subscription_tier, brand_voice")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    };
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0a0c1a]">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b border-border/10 bg-card/5 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="lg:hidden" />
                <div className="p-2 bg-primary rounded-xl">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold bg-primary bg-clip-text text-transparent">
                  Brand Voice
                </h1>
              </div>
            </div>
          </header>
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <p className="text-muted-foreground">
                  Customize your unique brand voice for consistent content
                </p>
              </div>
              <BrandVoiceSettings
                brandVoice={profile?.brand_voice || null}
                isPremium={profile?.subscription_tier !== "free"}
                onUpdate={handleUpdate}
              />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
