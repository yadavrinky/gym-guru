"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function WorkoutPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    exercise_name: "",
    duration_minutes: "",
    calories_burned: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/exercise", {
        ...formData,
        duration_minutes: parseFloat(formData.duration_minutes),
        calories_burned: parseFloat(formData.calories_burned),
        user_id: "current_user_id"
      });
      toast({
        title: "Workout Logged",
        description: "Your exercise has been recorded successfully.",
      });
      setFormData({ exercise_name: "", duration_minutes: "", calories_burned: "" });
    } catch (error) {
      console.error("Failed to log workout", error);
      toast({
        title: "Error",
        description: "Failed to log workout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Log Exercise</h2>
        <p className="text-muted-foreground">Keep track of your physical activities.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exercise Details</CardTitle>
          <CardDescription>Enter the details of your latest workout.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exercise_name">Exercise Name</Label>
              <Input
                id="exercise_name"
                placeholder="e.g., Bench Press, Running"
                value={formData.exercise_name}
                onChange={(e) => setFormData({ ...formData, exercise_name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories">Calories Burned</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="250"
                  value={formData.calories_burned}
                  onChange={(e) => setFormData({ ...formData, calories_burned: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Log Exercise"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}
