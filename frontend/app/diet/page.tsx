"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DietPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    food_name: "",
    quantity: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/diet/food", {
        ...formData,
        quantity: parseFloat(formData.quantity),
        calories: parseFloat(formData.calories),
        protein: parseFloat(formData.protein),
        carbs: parseFloat(formData.carbs),
        fat: parseFloat(formData.fat),
        user_id: "current_user_id"
      });
      toast({
        title: "Food Logged",
        description: "Your meal has been recorded successfully.",
      });
      setFormData({ food_name: "", quantity: "", calories: "", protein: "", carbs: "", fat: "" });
    } catch (error) {
      console.error("Failed to log food", error);
      toast({
        title: "Error",
        description: "Failed to log food. Please try again.",
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
        <h2 className="text-3xl font-bold tracking-tight">Log Food</h2>
        <p className="text-muted-foreground">Keep track of your daily nutrition.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meal Details</CardTitle>
          <CardDescription>Enter the nutritional information of what you ate.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="food_name">Food Name</Label>
                <Input
                  id="food_name"
                  placeholder="e.g., Chicken Breast"
                  value={formData.food_name}
                  onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (g/ml)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="200"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="300"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="30"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="0"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  placeholder="10"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Log Food"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}
