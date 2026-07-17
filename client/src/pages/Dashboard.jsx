import React, { useState } from "react";
import {
  Upload,
  FileAudio,
  Loader2,
  CheckCircle,
  AlertCircle,
  Activity,
  Type,
  Sparkles,
} from "lucide-react";
import { analyzeAudio } from "../services/api";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith("audio/")) {
        setFile(selectedFile);
        setResult(null);
        setError("");
      } else {
        setError("Please select a valid audio file (e.g., MP3, WAV).");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const data = await analyzeAudio(file);
      setResult(data);
    } catch (err) {
      setError(
        err.message || "Could not connect to the server. Is the backend awake?",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))] p-6 md:p-12 font-sans text-slate-100 antialiased">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Top Branding & Header */}
        <div className="text-center space-y-4 relative">
          {/* #weN Premium Glow Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)] animate-pulse">
            <Sparkles size={12} />
            Powered by #weN
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-200">
              Audio Analyzer
            </h1>
            <p className="text-slate-400 max-w-md mx-auto text-sm md:text-base font-medium">
              Upload your recording to instantly decode pitch, flow, and
              grammatical accuracy.
            </p>
          </div>
        </div>

        {/* Main Interface Box */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden group">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/15 transition-all duration-500" />

          {/* Upload Dropzone */}
          <div className="relative">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
              id="audio-upload"
            />
            <label
              htmlFor="audio-upload"
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 md:p-12 cursor-pointer transition-all duration-300
                ${
                  file
                    ? "border-indigo-500/50 bg-indigo-500/[0.03] hover:bg-indigo-500/[0.06]"
                    : "border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 hover:border-slate-700"
                }`}
            >
              <div
                className={`p-4 rounded-2xl transition-all duration-300 shadow-lg
                ${
                  file
                    ? "bg-indigo-500 text-white shadow-indigo-500/20"
                    : "bg-slate-900 text-slate-400 group-hover:text-slate-300"
                }`}
              >
                {file ? (
                  <FileAudio size={36} className="animate-bounce" />
                ) : (
                  <Upload size={36} />
                )}
              </div>

              <div className="text-center mt-5 space-y-1">
                <span className="font-semibold text-base block text-slate-200 group-hover:text-white transition-colors">
                  {file ? file.name : "Drop your audio recording here"}
                </span>
                <span className="text-xs text-slate-500 block font-medium">
                  {file
                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                    : "Supports high-fidelity MP3, WAV, M4A"}
                </span>
              </div>
            </label>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-950/30 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3 text-sm animate-in fade-in zoom-in-95">
              <AlertCircle size={18} className="shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full mt-6 py-4 px-6 rounded-2xl font-bold tracking-wide text-sm md:text-base flex items-center justify-center gap-2.5 transition-all duration-300
              ${
                !file || uploading
                  ? "bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-800/30"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.4)] active:scale-[0.98]"
              }`}
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin text-white" size={20} />
                <span className="animate-pulse">Parsing Voice Core...</span>
              </>
            ) : (
              "Initiate Analysis"
            )}
          </button>
        </div>

        {/* Structured Results Display */}
        {result && (
          <div className="bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-indigo-500/20 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Soft decorative background glow */}
            <div className="absolute -right-24 -bottom-24 w-52 h-52 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <CheckCircle size={22} />
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Diagnostics Complete
                </h2>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                ID: #weN-Engine
              </span>
            </div>

            {/* Analytic Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                  <Activity size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Acoustic Pitch
                  </span>
                </div>
                <p className="text-sm md:text-base font-semibold text-slate-200 leading-relaxed">
                  {result.analysis.pitch}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                  <Type size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Grammar Issues
                  </span>
                </div>
                <p className="text-sm md:text-base font-semibold text-slate-200 leading-relaxed">
                  {result.analysis.grammar_issues_found}
                </p>
              </div>
            </div>

            {/* Complete Transcription Segment */}
            <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 space-y-2.5">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Transcription
              </span>
              <p className="text-slate-300 leading-relaxed font-medium italic text-sm md:text-base">
                "{result.analysis.transcription}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
