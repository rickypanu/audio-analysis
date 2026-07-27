import React from "react";
import { Sparkles, History, LogOut, User, Activity } from "lucide-react";

export default function Header({ user, onLogout, onToggleHistory, historyCount }) {
  return (
    <header className="relative text-center max-w-4xl mx-auto space-y-8 select-none py-4 font-[family-name:var(--font-inter,'Inter',sans-serif)]">
      
      {/* Background Ambient Glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 blur-3xl pointer-events-none rounded-full" />

      {/* Top Utility Bar */}
      <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-indigo-400 backdrop-blur-2xl shadow-2xl shadow-indigo-950/20">
        
        {/* Left Branding Badge */}
        <div className="flex items-center gap-2.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/50">
          <div className="relative flex items-center justify-center">
            <Sparkles size={15} className="text-indigo-400 shrink-0 animate-pulse" />
            <span className="absolute inset-0 bg-indigo-400/20 blur-sm rounded-full" />
          </div>
          <span className="font-['JetBrains_Mono',monospace] text-[11px] tracking-widest font-semibold text-slate-400">
            Engine Core <span className="text-indigo-400 font-bold">#WeNStudy</span>
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-['JetBrains_Mono',monospace] font-medium border border-emerald-500/20">
            <Activity size={10} className="animate-spin" /> LIVE
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* History Button */}
          <button
            onClick={onToggleHistory}
            className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer shadow-inner active:scale-95"
          >
            <History size={14} className="text-indigo-400 group-hover:rotate-[-12deg] transition-transform duration-200" />
            <span className="font-medium">History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-['JetBrains_Mono',monospace] font-bold shadow-sm">
                {historyCount}
              </span>
            )}
          </button>

          <div className="h-4 w-[1px] bg-slate-800/80 mx-0.5" />

          {/* User Profile Info */}
          {user && (
            <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950/40 border border-slate-800/50 text-xs text-slate-300 font-['JetBrains_Mono',monospace]">
              <div className="w-5 h-5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                <User size={11} />
              </div>
              <span className="max-w-[110px] truncate font-medium text-slate-300">
                {user.name || "Operator"}
              </span>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40 transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
            title="Logout"
          >
            <LogOut size={13} />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Title Hero Section */}
      <div className="space-y-4 pt-2">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif] leading-[1.1]">
          Audio{" "}
          <span className="font-['Playfair_Display',serif] italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 pr-2">
            Analyzer
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-normal leading-relaxed tracking-normal font-['Inter',sans-serif]">
          Upload production audio metrics to systematically track vocal signatures, phonetic syntax configurations, and real-time processing data.
        </p>
      </div>

    </header>
  );
}