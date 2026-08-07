import React, { useState } from "react";
import { CheckCircle, Activity, Type, Edit2, Check, Sparkles, AlertTriangle } from "lucide-react";
import ActionToolbar from "./ActionToolbar";
import DataCard from "./DataCard";

export default function DiagnosticsOutput({ result, copiedField, onCopy, onShare, onSaveFile }) {
  const analysis = result?.analysis || {};
  
  // Dynamic report title/filename state
  const defaultFileName = result?.fileName || result?.file_info?.filename || "diagnostics-report";
  const [reportTitle, setReportTitle] = useState(defaultFileName.replace(/\.[^/.]+$/, ""));
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Normalize structure (supports new schema & legacy fallbacks)
  const pitchText = analysis.pitch_and_tone_analysis || analysis.pitch || "N/A";
  const transcriptionText = analysis.transcription || "N/A";
  const feedbackText = analysis.key_takeaways_and_feedback || "N/A";
  const grammarList = Array.isArray(analysis.grammar_and_pronunciation_issues)
    ? analysis.grammar_and_pronunciation_issues
    : null;

  const pdfMetricsData = {
    title: reportTitle,
    summary: transcriptionText,
    stats: [
      { label: "Pitch & Acoustic Analysis", value: pitchText },
      { label: "Actionable Feedback", value: feedbackText },
    ],
    grammarIssues: grammarList,
  };

  const handleCustomSaveFile = (type) => {
    if (type === "txt") {
      let textContent = `DIAGNOSTICS ANALYSIS REPORT: ${reportTitle}\n`;
      textContent += `==========================================\n\n`;
      textContent += `1. ACOUSTIC & PITCH ANALYSIS:\n${pitchText}\n\n`;
      
      if (grammarList && grammarList.length > 0) {
        textContent += `2. GRAMMAR & PRONUNCIATION ISSUES:\n`;
        grammarList.forEach((item, idx) => {
          textContent += `   [${idx + 1}] Spoken: "${item.original_phrase}"\n`;
          textContent += `       Correction: "${item.correction}"\n`;
          textContent += `       Notes: ${item.explanation}\n\n`;
        });
      } else if (analysis.grammar_issues_found) {
        textContent += `2. GRAMMAR EVALUATION:\n${analysis.grammar_issues_found}\n\n`;
      }

      textContent += `3. ACTIONABLE FEEDBACK:\n${feedbackText}\n\n`;
      textContent += `4. VERBATIM TRANSCRIPTION:\n${transcriptionText}\n`;

      const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportTitle.toLowerCase().replace(/\s+/g, "-")}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }

    if (onSaveFile) {
      onSaveFile(type, reportTitle);
    }
  };

  return (
    <section className="bg-slate-900/35 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-indigo-500/10 shadow-xl space-y-6 animate-in fade-in duration-500">
      {/* Title & Editable Name Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/60 pb-4 gap-3">
        <div className="flex items-center gap-2.5 text-emerald-400">
          <CheckCircle size={20} className="shrink-0" />
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="bg-slate-950 text-white font-bold text-base px-2 py-1 rounded border border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                autoFocus
              />
              <button
                onClick={() => setIsEditingTitle(false)}
                className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                title="Save Title"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h3 className="text-lg font-bold tracking-tight text-white">{reportTitle}</h3>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-indigo-400 transition-opacity p-1"
                title="Rename Report File"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </div>
        <span className="text-[10px] font-mono tracking-widest text-slate-400 bg-slate-950 px-3 py-1 rounded border border-slate-800/80 uppercase self-start sm:self-auto">
          Telemetry Output
        </span>
      </div>

      <ActionToolbar
        onShare={onShare}
        onSaveFile={handleCustomSaveFile}
        metricsData={pdfMetricsData}
        fileName={reportTitle}
      />

      {/* Acoustic Pitch Profile Card */}
      <DataCard
        title="Acoustic Pitch & Tone Profile"
        content={pitchText}
        icon={Activity}
        isCopied={copiedField === "pitch"}
        onCopy={() => onCopy(pitchText, "pitch")}
      />

      {/* Grammar & Pronunciation Issues (Structured or Fallback) */}
      {grammarList ? (
        <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800/60 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 border-b border-slate-800/60 pb-3">
            <Type size={16} className="shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Grammar & Pronunciation Audit ({grammarList.length} items)
            </span>
          </div>

          {grammarList.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No grammar or pronunciation errors detected.</p>
          ) : (
            <div className="space-y-3">
              {grammarList.map((item, index) => (
                <div key={index} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-rose-400 flex items-center gap-1.5 font-medium">
                      <AlertTriangle size={12} /> "{item.original_phrase}"
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      → "{item.correction}"
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed font-sans pl-4 border-l border-slate-800">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <DataCard
          title="Grammar Core Evaluation"
          content={analysis.grammar_issues_found || "N/A"}
          icon={Type}
          isCopied={copiedField === "grammar"}
          onCopy={() => onCopy(analysis.grammar_issues_found, "grammar")}
        />
      )}

      {/* Actionable Feedback */}
      {feedbackText !== "N/A" && (
        <DataCard
          title="Actionable Speaker Coaching & Feedback"
          content={feedbackText}
          icon={Sparkles}
          isCopied={copiedField === "feedback"}
          onCopy={() => onCopy(feedbackText, "feedback")}
        />
      )}

      {/* Verbatim Transcript */}
      <DataCard
        title="Decoded Verbatim Transcript"
        content={transcriptionText}
        isCopied={copiedField === "transcription"}
        onCopy={() => onCopy(transcriptionText, "transcription")}
        isBlockquote
      />
    </section>
  );
}