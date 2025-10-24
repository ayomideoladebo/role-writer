import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, Briefcase } from "lucide-react";

const ROLES = [
  "Marketing Professional",
  "Entrepreneur",
  "Content Creator",
  "Sales Professional",
  "Consultant",
  "Freelancer",
];

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Real Estate",
  "Consulting",
  "Creative & Design",
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual & Friendly" },
  { value: "inspiring", label: "Inspiring & Motivational" },
  { value: "thought-leader", label: "Thought Leader" },
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          role,
          industry,
          tone_preference: tone,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile set up successfully!");
      navigate("/dashboard/generate");
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary to-background">
      <Card className="w-full max-w-2xl shadow-hover border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-2xl">
              <Briefcase className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Let's personalize your experience</CardTitle>
          <CardDescription>Tell us about yourself to get tailored content</CardDescription>
          <div className="flex justify-center mt-4 gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full transition-all ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="space-y-3">
                <Label>What's your role?</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>What industry are you in?</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!role || !industry}
                className="w-full bg-primary hover:opacity-90"
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="space-y-3">
                <Label>Choose your preferred tone</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TONES.map((t) => (
                    <Card
                      key={t.value}
                      className={`cursor-pointer transition-all hover:shadow-hover ${
                        tone === t.value
                          ? "border-primary border-2 bg-gradient-card"
                          : "border-2 hover:border-primary/50"
                      }`}
                      onClick={() => setTone(t.value)}
                    >
                      <CardContent className="p-4">
                        <p className="font-medium">{t.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={!tone || loading}
                  className="flex-1 bg-primary hover:opacity-90"
                >
                  {loading ? "Setting up..." : "Complete Setup"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;