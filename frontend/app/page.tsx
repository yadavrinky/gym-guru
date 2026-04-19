import Link from "next/link";
import { ArrowRight, Activity, Camera, Brain, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-dark text-white bg-gradient-to-br from-slate-900 to-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px]" />
         <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="z-10 text-center max-w-4xl mx-auto space-y-8">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">GYM GURU</span> AI
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
          The ultimate camera-only AI fitness ecosystem. Perfect your form, track your diet, and train smarter.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 mb-16 text-left">
          <FeatureCard 
            icon={<Camera className="w-8 h-8 text-emerald-400" />}
            title="AI Trainer"
            desc="Real-time pose tracking & rep counting. 100% on-device privacy."
          />
          <FeatureCard 
            icon={<MessageSquare className="w-8 h-8 text-blue-400" />}
            title="Smart Dietician"
            desc="Personalised nutrition plans matching your exact calorie burn."
          />
          <FeatureCard 
            icon={<Brain className="w-8 h-8 text-purple-400" />}
            title="Gym Buddy"
            desc="Emotionally intelligent companion adapting to your mood."
          />
          <FeatureCard 
            icon={<Activity className="w-8 h-8 text-rose-400" />}
            title="Habit Predictor"
            desc="Proactive ML-driven nudges before you even consider skipping."
          />
        </div>

        <div className="flex gap-4 justify-center items-center">
          <Link href="/login" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-full transition-all flex items-center gap-2 transform hover:scale-105 shadow-xl shadow-emerald-500/20">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/register" className="px-8 py-4 glass-dark hover:bg-white/10 text-white font-medium rounded-full transition-all">
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-dark p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}
