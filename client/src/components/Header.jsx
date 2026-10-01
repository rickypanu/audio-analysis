import React from 'react';

export default function Header({ user, onLogout, onToggleHistory, historyCount = 0 }) {
  const extractName = (data) => {
    if (typeof data === 'string' && data.trim()) return data.trim();
    if (data && typeof data === 'object') {
      const candidates = [
        data.username,
        data.name,
        data.email,
        data.user?.username,
        data.user?.name,
        data.user?.email,
      ];
      for (const val of candidates) {
        if (typeof val === 'string' && val.trim()) {
          return val.trim();
        }
      }
    }
    return 'User';
  };

  const username = extractName(user);
  const userAvatarInitial = username.charAt(0).toUpperCase();

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl px-4 py-3.5 md:px-6 shadow-2xl shadow-indigo-950/20 flex items-center justify-between transition-all relative z-30">
      
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3.5">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-300"></div>
          <div className="relative w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-inner">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              Audio Diagnostic
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
              Studio
            </span>
          </div>
       
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        
        {/* History Toggle Button */}
        <button
          onClick={onToggleHistory}
          className="relative px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-2 transition-all active:scale-95 shadow-sm group"
          title="View Inspection History"
        >
          <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">History</span>
          {historyCount > 0 && (
            <span className="px-1.5 py-0.5 bg-pink-500/15 text-pink-400 border border-pink-500/30 text-[10px] font-bold rounded-full">
              {historyCount}
            </span>
          )}
        </button>

        <div className="h-5 w-[1px] bg-slate-800/80 hidden sm:block" />

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800/80 pl-1.5 pr-3 py-1.5 rounded-xl shadow-inner">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 p-[1px] shadow-sm">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center text-slate-100 text-xs font-black">
              {userAvatarInitial}
            </div>
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase leading-none mb-0.5">
              Account
            </span>
            <span className="text-xs font-bold text-slate-200 leading-none truncate max-w-[100px]">
              {username}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 sm:px-3 sm:py-2 bg-slate-800/40 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-700/50 hover:border-red-500/20 rounded-xl text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5 group"
            title="Sign Out"
          >
            <svg className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden md:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}