"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, Flame, Utensils } from "lucide-react";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    total_calories_intake: 0,
    total_workout_duration: 0,
    total_protein: 0,
    total_calories_burned: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [exerciseRes, dietRes] = await Promise.all([
          api.get("/exercise/today"),
          api.get("/diet/today")
        ]);
        
        const totalDuration = exerciseRes.data.reduce((acc: number, curr: any) => acc + (curr.duration_minutes || 0), 0);
        const totalCaloriesBurned = exerciseRes.data.reduce((acc: number, curr: any) => acc + (curr.calories_burned || 0), 0);
        const totalCaloriesIntake = dietRes.data.reduce((acc: number, curr: any) => acc + (curr.calories || 0), 0);
        const totalProtein = dietRes.data.reduce((acc: number, curr: any) => acc + (curr.protein || 0), 0);
        
        setSummary({
          total_calories_intake: Math.round(totalCaloriesIntake),
          total_workout_duration: Math.round(totalDuration),
          total_protein: Math.round(totalProtein * 10) / 10,
          total_calories_burned: Math.round(totalCaloriesBurned),
        });
      } catch (error) {
        console.error("Failed to fetch dashboard summary", error);
      }
    };

    fetchSummary();
  }, []);

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your daily overview.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Calories</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_calories_intake} kcal</div>
              <p className="text-xs text-muted-foreground">Total energy intake</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Workout Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_workout_duration} mins</div>
              <p className="text-xs text-muted-foreground">Total active time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protein Intake</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_protein} g</div>
              <p className="text-xs text-muted-foreground">From today&apos;s meals</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Burn</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_calories_burned} kcal</div>
              <p className="text-xs text-muted-foreground">From exercises</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

