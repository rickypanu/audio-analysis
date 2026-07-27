import React from "react";
import { ArrowLeft, Calendar, FileAudio } from "lucide-react";
import DiagnosticsOutput from "./DiagnosticsOutput";

export default function DetailedAnalysisView({ selectedRecord, onBack }) {
  if (!selectedRecord) return null;

  // Normalizes the analysis data structure coming from DB or fresh API response
  const resultData = selectedRecord.data || selectedRecord;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-all"
        >
          <ArrowLeft size={14} /> Back to Intake
        </button>

        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <FileAudio size={13} className="text-indigo-400" />
            {selectedRecord.fileName || selectedRecord.file_info?.filename || "Audio File"}
          </span>
          <span className="flex items-center gap-1 border-l border-slate-800 pl-4">
            <Calendar size={13} className="text-slate-500" />
            {selectedRecord.timestamp ? new Date(selectedRecord.timestamp).toLocaleDateString() : "Today"}
          </span>
        </div>
      </div>

      {/* Render Diagnostics */}
      <DiagnosticsOutput result={resultData} />
    </div>
  );
}