"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Target, Flame, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Summary {
  total_sessions: number;
  total_reps: number;
  avg_form_score: number;
  calories_burned_total: number;
}

interface WeeklyReport {
  x_axis: string[];
  y_axis: number[];
  total_weekly_reps: number;
  total_sessions: number;
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [weeklyData, setWeeklyData] = useState<{ day: string; reps: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, weeklyRes] = await Promise.all([
          api.get("/analytics/summary/me"),
          api.get("/analytics/weekly-report/me"),
        ]);

        setSummary(summaryRes.data);

        const report: WeeklyReport = weeklyRes.data;
        const chartData = report.x_axis.map((day, i) => ({
          day,
          reps: report.y_axis[i] || 0,
        }));
        setWeeklyData(chartData);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Your workout performance at a glance.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground animate-pulse">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary?.total_sessions ?? 0}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reps</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary?.total_reps ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Across all sessions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Form Score</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary?.avg_form_score ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Out of 100</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary?.calories_burned_total ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Total all time</p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Reps</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Daily rep volume over the past 7 days.
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12 }}
                        className="fill-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        className="fill-muted-foreground"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Bar
                        dataKey="reps"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
