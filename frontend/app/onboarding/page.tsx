"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

const GOALS = ["Lose Weight", "Build Muscle", "Stay Fit", "Gain Weight"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    gender: "",
    date_of_birth: "",
    height_cm: "",
    weight_kg: "",
    fitness_goal: "",
    experience_level: "",
  });
  const router = useRouter();
  const { refreshUser } = useAuth();

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put("/auth/update-profile", {
        gender: form.gender || undefined,
        date_of_birth: form.date_of_birth || undefined,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : undefined,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        fitness_goal: form.fitness_goal || undefined,
        experience_level: form.experience_level || undefined,
      });
      await refreshUser();
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>Step {step} of 3 — Help us personalize your experience</CardDescription>
            <div className="flex gap-2 pt-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Male", "Female", "Other"].map((g) => (
                      <Button key={g} type="button" variant={form.gender === g ? "default" : "outline"} className="w-full" onClick={() => update("gender", g)}>
                        {g}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input id="height" type="number" placeholder="170" value={form.height_cm} onChange={(e) => update("height_cm", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" placeholder="70" value={form.weight_kg} onChange={(e) => update("weight_kg", e.target.value)} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Fitness Goal</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {GOALS.map((g) => (
                      <Button key={g} type="button" variant={form.fitness_goal === g ? "default" : "outline"} className="w-full text-sm" onClick={() => update("fitness_goal", g)}>
                        {g}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {LEVELS.map((l) => (
                      <Button key={l} type="button" variant={form.experience_level === l ? "default" : "outline"} className="w-full text-sm" onClick={() => update("experience_level", l)}>
                        {l}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" className="flex-1" onClick={() => setStep(step + 1)}>
                  Continue
                </Button>
              ) : (
                <Button type="button" className="flex-1" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : "Complete Setup"}
                </Button>
              )}
            </div>

            <button type="button" className="text-sm text-muted-foreground hover:underline w-full text-center" onClick={() => router.push("/dashboard")}>
              Skip for now
            </button>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
