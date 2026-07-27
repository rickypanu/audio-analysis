import React from "react";
import { Copy, Check } from "lucide-react";

export default function DataCard({ title, content, icon: Icon, isCopied, onCopy, isBlockquote = false }) {
  return (
    <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800/60 space-y-2 relative group hover:border-slate-800 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-400">
          {Icon && <Icon size={16} className="shrink-0" />}
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        </div>
        <button
          onClick={onCopy}
          className="text-slate-500 hover:text-indigo-400 p-1.5 rounded bg-slate-900 border border-slate-800/80 transition-all"
        >
          {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
      </div>
      
      {isBlockquote ? (
        <p className="text-slate-200 leading-relaxed font-normal text-base border-l-2 border-indigo-500/40 pl-4 py-0.5 bg-slate-950/10 rounded-r-lg">
          "{content}"
        </p>
      ) : (
        <p className="text-base font-semibold text-slate-200 leading-relaxed">
          {content}
        </p>
      )}
    </div>
  );
}