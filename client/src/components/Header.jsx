import React, { useState, useEffect } from "react";
import { Sparkles, History, LogOut, User, Flame, Users } from "lucide-react";

export default function Header({
  user,
  onLogout,
  onToggleHistory,
  historyCount,
}) {
  const [greeting, setGreeting] = useState("");

  // Dynamic greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning ☀️");
    else if (hour < 18) setGreeting("Good Afternoon 🌤️");
    else setGreeting("Good Evening 🌙");
  }, []);

  return (
    <header className="relative text-center max-w-4xl mx-auto space-y-8 select-none py-6 font-[family-name:var(--font-inter,'Inter',sans-serif)]">
      {/* Dynamic Animated Ambient Glows */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[28rem] h-36 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl pointer-events-none rounded-full animate-pulse" />
      <div className="absolute top-10 left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Utility Bar */}
      <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/50 border border-slate-700/50 text-indigo-400 backdrop-blur-xl shadow-2xl shadow-indigo-950/20">
        {/* Left Branding & Teammate Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-indigo-500/20 shadow-inner">
            <div className="relative flex items-center justify-center">
              <Sparkles
                size={14}
                className="text-indigo-400 shrink-0 animate-spin"
                style={{ animationDuration: "6s" }}
              />
              <span className="absolute inset-0 bg-indigo-400/30 blur-sm rounded-full" />
            </div>
            <span className="font-['JetBrains_Mono',monospace] text-[11px] tracking-wider font-semibold text-slate-300">
              #WeNStudy
            </span>
          </div>

          {/* Friends / Partners Badges */}
          <div className="hidden sm:flex items-center gap-1.5 font-['JetBrains_Mono',monospace] text-[10px] font-bold">
            <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/25 shadow-sm flex items-center gap-1 hover:scale-105 transition-transform cursor-default">
              🐵 #Monkesh
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 shadow-sm flex items-center gap-1 hover:scale-105 transition-transform cursor-default">
              🐼 #Panda
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* History Button */}
          <button
            onClick={onToggleHistory}
            className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-indigo-500/40 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <History
              size={14}
              className="text-indigo-400 group-hover:rotate-[-18deg] transition-transform duration-200"
            />
            <span className="font-medium">History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-['JetBrains_Mono',monospace] font-bold shadow-sm">
                {historyCount}
              </span>
            )}
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />

          {/* User Badge */}
          {user && (
            <div className="hidden md:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300 font-['JetBrains_Mono',monospace]">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                <User size={11} />
              </div>
              <span className="max-w-[100px] truncate font-medium text-slate-300">
                {user.name || "Operator"}
              </span>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40 transition-all duration-200 cursor-pointer active:scale-95"
            title="Logout"
          >
            <LogOut size={13} />
            <span className="font-semibold hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="space-y-4 pt-3 relative">
        {/* Subtle Greeting Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium tracking-wide shadow-sm">
          <Users size={12} className="text-indigo-400" />
          <span>{greeting}, time to sharpen our skills together</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif] leading-[1.1]">
          Voice & Speech{" "}
          <span className="font-['Playfair_Display',serif] italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 pr-2">
            Insights
          </span>
        </h1>

        {/* Friendly Description */}
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-normal leading-relaxed tracking-normal font-['Inter',sans-serif]">
          A dedicated space to analyze communication skills for interviews &
          personal growth. Built with grit, consistency, and big dreams for{" "}
          <span className="text-purple-300 font-semibold underline decoration-purple-500/40 underline-offset-4">
            #Monkesh 🐵
          </span>{" "}
          &{" "}
          <span className="text-indigo-300 font-semibold underline decoration-indigo-500/40 underline-offset-4">
            #Panda 🐼
          </span>
          .
        </p>

        {/* Motivation Pill */}
        <div className="pt-1 flex items-center justify-center gap-2 text-xs text-slate-500 font-['JetBrains_Mono',monospace]">
          <Flame size={13} className="text-amber-400 animate-pulse" />
          <span>Leveling up every single day</span>
        </div>
      </div>
    </header>
  );
}