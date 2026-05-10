"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

const GOALS = ["Lose Weight", "Build Muscle", "Stay Fit", "Gain Weight"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    gender: "",
    date_of_birth: "",
    height_cm: "",
    weight_kg: "",
    fitness_goal: "",
    experience_level: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        gender: user.profile?.gender || "",
        date_of_birth: user.profile?.date_of_birth || "",
        height_cm: user.profile?.height_cm?.toString() || "",
        weight_kg: user.profile?.weight_kg?.toString() || "",
        fitness_goal: user.profile?.fitness_goal || "",
        experience_level: user.profile?.experience_level || "",
      });
    }
  }, [user]);

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update name if changed
      if (form.name !== user?.name) {
        await api.put("/auth/update-name", { name: form.name });
      }
      // Update profile fields
      await api.put("/auth/update-profile", {
        gender: form.gender || undefined,
        date_of_birth: form.date_of_birth || undefined,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : undefined,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        fitness_goal: form.fitness_goal || undefined,
        experience_level: form.experience_level || undefined,
      });
      await refreshUser();
      toast({ title: "Profile Updated", description: "Your profile has been saved." });
    } catch (error) {
      console.error("Failed to update profile", error);
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">Manage your personal information and fitness preferences.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your basic details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="opacity-60" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["Male", "Female", "Other"].map((g) => (
                    <Button key={g} type="button" size="sm" variant={form.gender === g ? "default" : "outline"} onClick={() => update("gender", g)}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Body Measurements</CardTitle>
            <CardDescription>Your current physical stats.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" type="number" placeholder="170" value={form.height_cm} onChange={(e) => update("height_cm", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" placeholder="70" value={form.weight_kg} onChange={(e) => update("weight_kg", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fitness Preferences</CardTitle>
            <CardDescription>Help us tailor your experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <Button className="w-full" size="lg" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </ProtectedRoute>
  );
}
