import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Upload, RefreshCw, Settings2, ArrowLeft } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState({
    role: "",
    industry: "",
    tone_preference: "",
    interests: "",
    target_audience: "",
    content_goals: "",
    posting_frequency: "",
    avatar_url: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role, industry, tone_preference, interests, target_audience, content_goals, posting_frequency, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile({
        role: data.role || "",
        industry: data.industry || "",
        tone_preference: data.tone_preference || "",
        interests: data.interests || "",
        target_audience: data.target_audience || "",
        content_goals: data.content_goals || "",
        posting_frequency: data.posting_frequency || "",
        avatar_url: data.avatar_url || "",
      });
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success("Profile picture updated!");
    } catch (error: any) {
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          role: profile.role,
          industry: profile.industry,
          tone_preference: profile.tone_preference,
          interests: profile.interests,
          target_audience: profile.target_audience,
          content_goals: profile.content_goals,
          posting_frequency: profile.posting_frequency,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b border-border/10 bg-card/5 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/dashboard")}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="p-2 bg-primary rounded-xl">
                    <Settings2 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h1 className="text-xl font-bold">Profile Settings</h1>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Profile Picture Section */}
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Profile Picture</h2>
                  <p className="text-sm text-muted-foreground">
                    Upload your profile picture for a personalized experience
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-primary/20">
                    <AvatarImage src={profile.avatar_url} alt="Profile" />
                    <AvatarFallback className="bg-primary/10">
                      <User className="w-12 h-12 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                    <Label htmlFor="avatar-upload">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingAvatar}
                        onClick={() => document.getElementById("avatar-upload")?.click()}
                      >
                        {uploadingAvatar ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Picture
                          </>
                        )}
                      </Button>
                    </Label>
                  </div>
                </div>
              </Card>

              {/* Basic Information */}
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
                  <p className="text-sm text-muted-foreground">
                    Tell us about your professional background
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      placeholder="e.g., Marketing Manager"
                      value={profile.role}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      placeholder="e.g., Technology"
                      value={profile.industry}
                      onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone Preference</Label>
                  <Select
                    value={profile.tone_preference}
                    onValueChange={(value) => setProfile({ ...profile, tone_preference: value })}
                  >
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual & Friendly</SelectItem>
                      <SelectItem value="inspirational">Inspiring & Motivational</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="thought-leader">Thought Leader</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Content Preferences */}
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Content Preferences</h2>
                  <p className="text-sm text-muted-foreground">
                    Help us personalize your content generation
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="interests">Interests & Expertise</Label>
                    <Textarea
                      id="interests"
                      placeholder="e.g., AI, Leadership, Innovation, Digital Marketing..."
                      value={profile.interests}
                      onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      List topics you're passionate about or expert in
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target_audience">Target Audience</Label>
                    <Textarea
                      id="target_audience"
                      placeholder="e.g., Tech professionals, Entrepreneurs, Business leaders..."
                      value={profile.target_audience}
                      onChange={(e) => setProfile({ ...profile, target_audience: e.target.value })}
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">
                      Who are you trying to reach with your content?
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content_goals">Content Goals</Label>
                    <Textarea
                      id="content_goals"
                      placeholder="e.g., Build thought leadership, Drive engagement, Generate leads..."
                      value={profile.content_goals}
                      onChange={(e) => setProfile({ ...profile, content_goals: e.target.value })}
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">
                      What do you want to achieve with your content?
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="posting_frequency">Posting Frequency</Label>
                    <Select
                      value={profile.posting_frequency}
                      onValueChange={(value) => setProfile({ ...profile, posting_frequency: value })}
                    >
                      <SelectTrigger id="posting_frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="3-4-times-week">3-4 times a week</SelectItem>
                        <SelectItem value="2-3-times-week">2-3 times a week</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="min-w-[120px]"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
