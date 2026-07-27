import React from "react";
import { Share2, Download, Mail } from "lucide-react";

export default function ActionToolbar({ onShare, onSaveFile }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl text-sm">
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-500 font-mono tracking-wider flex items-center gap-1.5 uppercase">
          <Share2 size={12} /> Share Output Metrics
        </span>
        <div className="flex flex-wrap gap-1.5">
          {navigator.share && (
            <button
              onClick={() => onShare("native")}
              className="px-2.5 py-1 text-xs rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
            >
              System Share
            </button>
          )}
          <button
            onClick={() => onShare("whatsapp")}
            className="px-2.5 py-1 text-xs rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 transition-colors"
          >
            WhatsApp
          </button>
          <button
            onClick={() => onShare("telegram")}
            className="px-2.5 py-1 text-xs rounded-lg bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 border border-sky-500/20 transition-colors"
          >
            Telegram
          </button>
          <button
            onClick={() => onShare("email")}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1"
          >
            <Mail size={10} /> Email
          </button>
        </div>
      </div>

      <div className="space-y-2 md:border-l md:border-slate-800/80 md:pl-4">
        <span className="text-xs font-semibold text-slate-500 font-mono tracking-wider flex items-center gap-1.5 uppercase">
          <Download size={12} /> Local Export Engine
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onSaveFile("txt")}
            className="px-3 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400 transition-colors font-mono"
          >
            Export .txt
          </button>
          <button
            onClick={() => onSaveFile("pdf")}
            className="px-3 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-rose-400 transition-colors font-mono"
          >
            Print .pdf
          </button>
        </div>
      </div>
    </div>
  );
}