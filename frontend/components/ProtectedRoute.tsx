"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for initial token load from localStorage (token will be null initially)
    const saved = localStorage.getItem("token");
    if (!saved) {
      router.push("/login");
    }
  }, [router]);

  // Show nothing while checking auth
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
