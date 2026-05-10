"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Dumbbell, 
  Utensils, 
  MessageSquare,
  BarChart3,
  Camera,
  UserCog,
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Workout", href: "/workout", icon: Dumbbell },
  { name: "Live Trainer", href: "/workout/live", icon: Camera },
  { name: "Diet", href: "/diet", icon: Utensils },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Profile", href: "/profile", icon: UserCog },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col w-64 h-screen bg-card border-r">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Gym Guru</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t space-y-2">
        <div className="flex items-center px-4 py-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
             {user?.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={logout}>
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
