import React from "react";
import { FileAudio, Loader2, AlertCircle, RotateCcw } from "lucide-react";

export default function AudioIntake({
  file,
  currentFileName,
  currentFileSize,
  uploading,
  loadingFact,
  error,
  hasActiveData,
  onFileChange,
  onUpload,
  onReset,
}) {
  return (
    <section className="bg-slate-900/30 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
        <div className="space-y-0.5">
          <h3 className="text-lg font-bold text-white tracking-tight">Audio Asset Intake</h3>
          <p className="text-xs text-slate-500">Provide high-fidelity targets for computational mapping diagnostics.</p>
        </div>
        {hasActiveData && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-all active:scale-95 shadow-sm font-mono"
          >
            <RotateCcw size={12} />
            Reset Engine
          </button>
        )}
      </div>

      <div className="relative">
        <input
          type="file"
          accept="audio/*"
          onChange={onFileChange}
          className="hidden"
          id="audio-upload"
          disabled={uploading}
        />
        <label
          htmlFor="audio-upload"
          className={`group flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 md:p-12 cursor-pointer transition-all duration-300 min-h-[200px]
            ${uploading ? "border-indigo-500/20 bg-indigo-950/5 cursor-wait" : ""}
            ${!uploading && currentFileName ? "border-indigo-500/40 bg-indigo-950/10" : ""}
            ${!uploading && !currentFileName ? "border-slate-800 bg-slate-950/30 hover:bg-slate-950/50 hover:border-slate-700" : ""}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-4 text-center max-w-md px-4">
              <Loader2 className="animate-spin text-indigo-400" size={28} />
              <div className="space-y-1">
                <span className="text-sm font-bold tracking-wider text-slate-200 font-mono block">
                  Processing Voice Arrays...
                </span>
                <p className="text-xs text-slate-400 italic font-medium leading-normal">
                  "{loadingFact}"
                </p>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`p-4 rounded-xl transition-all shadow-sm ${
                  currentFileName ? "bg-indigo-600 text-white scale-105" : "bg-slate-900 text-slate-500 group-hover:text-slate-300"
                }`}
              >
                <FileAudio size={24} />
              </div>
              <div className="text-center mt-4 space-y-1 max-w-[90%]">
                <span className="font-semibold text-sm block text-slate-200 truncate">
                  {currentFileName || "Select raw audio component track"}
                </span>
                <span className="text-xs text-slate-500 block">
                  {currentFileSize
                    ? `${(currentFileSize / (1024 * 1024)).toFixed(2)} MB`
                    : "Accepts WAV, MP3, or M4A architecture structures"}
                </span>
              </div>
            </>
          )}
        </label>
      </div>

      {error && (
        <div className="p-3.5 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-2.5 text-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-medium leading-normal">{error}</span>
        </div>
      )}

      {!hasActiveData && (
        <button
          onClick={onUpload}
          disabled={!file || uploading}
          className={`w-full py-3.5 px-6 rounded-xl font-bold tracking-wide text-xs md:text-sm flex items-center justify-center gap-2 transition-all
            ${
              !file || uploading
                ? "bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-800/40"
                : "bg-white text-slate-950 hover:bg-slate-200 active:scale-[0.99] shadow-md font-semibold"
            }`}
        >
          {uploading ? "Analyzing Ingestion Pipeline..." : "Execute Core Signal Diagnosis"}
        </button>
      )}
    </section>
  );
}