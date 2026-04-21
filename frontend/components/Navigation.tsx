"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Activity, Utensils, Heart, Dumbbell } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  
  // Hide on public routes
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const links = [
    { href: '/dashboard', label: 'Analytics', icon: <LayoutDashboard size={20} /> },
    { href: '/habit', label: 'Habit Tracker', icon: <Activity size={20} /> },
    { href: '/diet', label: 'Dietician', icon: <Utensils size={20} /> },
    { href: '/buddy', label: 'Gym Buddy', icon: <Heart size={20} /> },
    { href: '/workout', label: 'AI Trainer', icon: <Dumbbell size={20} /> },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-dark border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="text-xl font-black italic tracking-tighter text-emerald-400">
            GYM GURU
          </div>
          <div className="flex gap-4 overflow-x-auto">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                  pathname === link.href ? 'bg-emerald-500 text-white font-bold' : 'text-slate-900/60 hover:text-slate-900 hover:bg-white/5'
                }`}
              >
                {link.icon}
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
