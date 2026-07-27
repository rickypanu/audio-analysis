import React from "react";
import { CheckCircle, Activity, Type } from "lucide-react";
import ActionToolbar from "./ActionToolbar";
import DataCard from "./DataCard";

export default function DiagnosticsOutput({ result, copiedField, onCopy, onShare, onSaveFile }) {
  return (
    <section className="bg-slate-900/30 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-indigo-500/10 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle size={20} />
          <h3 className="text-lg font-bold tracking-tight text-white">Diagnostics Analysis Completed</h3>
        </div>
        <span className="text-[10px] font-mono tracking-widest text-slate-400 bg-slate-950 px-3 py-1 rounded border border-slate-800/80 uppercase">
          Telemetry Output
        </span>
      </div>

      <ActionToolbar onShare={onShare} onSaveFile={onSaveFile} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DataCard
          title="Acoustic Pitch Profile"
          content={result?.analysis?.pitch}
          icon={Activity}
          isCopied={copiedField === "pitch"}
          onCopy={() => onCopy(result?.analysis?.pitch, "pitch")}
        />
        <DataCard
          title="Grammar Core Evaluation"
          content={result?.analysis?.grammar_issues_found}
          icon={Type}
          isCopied={copiedField === "grammar"}
          onCopy={() => onCopy(result?.analysis?.grammar_issues_found, "grammar")}
        />
      </div>

      <DataCard
        title="Decoded Transcript Processing Output"
        content={result?.analysis?.transcription}
        isCopied={copiedField === "transcription"}
        onCopy={() => onCopy(result?.analysis?.transcription, "transcription")}
        isBlockquote
      />
    </section>
  );
}