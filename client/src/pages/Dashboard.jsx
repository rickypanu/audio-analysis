import React, { useState, useEffect } from "react";
import {
  Upload,
  FileAudio,
  Loader2,
  CheckCircle,
  AlertCircle,
  Activity,
  Type,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Share2,
  Download,
  Mail
} from "lucide-react";
import { analyzeAudio } from "../services/api";
import { LOADING_FACTS } from "../utils/loadingFacts";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  // Backup state for metadata to preserve visual file details on page refresh
  const [persistedFileMeta, setPersistedFileMeta] = useState(() => {
    const savedMeta = localStorage.getItem("audio_file_meta");
    return savedMeta ? JSON.parse(savedMeta) : null;
  });

  const [uploading, setUploading] = useState(false);
  
  // Initialize state directly from localStorage to prevent flash of empty screen
  const [result, setResult] = useState(() => {
    const savedResult = localStorage.getItem("audio_analysis_result");
    return savedResult ? JSON.parse(savedResult) : null;
  });

  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState(null);
  const [factIndex, setFactIndex] = useState(0);

  // Interval hook for loading states
  useEffect(() => {
    let interval;
    if (uploading) {
      interval = setInterval(() => {
        setFactIndex((prev) => (prev + 1) % LOADING_FACTS.length);
      }, 3500);
    } else {
      setFactIndex(0);
    }
    return () => clearInterval(interval);
  }, [uploading]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith("audio/")) {
        setFile(selectedFile);
        setPersistedFileMeta(null);
        setResult(null);
        setError("");
        // Clean storage on new file staging
        localStorage.removeItem("audio_analysis_result");
        localStorage.removeItem("audio_file_meta");
      } else {
        setError("Please select a valid audio file (e.g., MP3, WAV, M4A).");
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
      
      // Extract structural metadata since file objects can't be stringified directly
      const meta = { name: file.name, size: file.size };
      
      // Lock into localStorage before updating component states
      localStorage.setItem("audio_analysis_result", JSON.stringify(data));
      localStorage.setItem("audio_file_meta", JSON.stringify(meta));
      
      setResult(data);
      setPersistedFileMeta(meta);
    } catch (err) {
      setError(err.message || "Could not connect to the server. Is the backend awake?");
    } finally {
      setUploading(false);
    }
  };

  // Explicit Clear Action by the user
  const resetUploader = () => {
    setFile(null);
    setPersistedFileMeta(null);
    setResult(null);
    setError("");
    localStorage.removeItem("audio_analysis_result");
    localStorage.removeItem("audio_file_meta");
  };

  const copyToClipboard = (text, fieldId) => {
    if (!text) return;
    navigator.clipboard.writeText(text.toString());
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateExportText = () => {
    const targetName = file?.name || persistedFileMeta?.name || "Unknown Track";
    return `Audio Diagnostics Report\nTarget File: ${targetName}\n\n1. Acoustic Pitch Analysis:\n${result?.analysis?.pitch}\n\n2. Grammar Systems Check:\n${result?.analysis?.grammar_issues_found}\n\n3. Decoded Speech Transcription:\n"${result?.analysis?.transcription}"`;
  };

  const handleShare = async (platform) => {
    const reportText = generateExportText();
    
    if (platform === "native" && navigator.share) {
      try {
        await navigator.share({
          title: "Audio Evaluation Metrics",
          text: reportText,
        });
        return;
      } catch (err) {
        console.log("Native share dismissed.");
      }
    }

    const encodedText = encodeURIComponent(reportText);
    const sharingEndpoints = {
      whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodedText}`,
      email: `mailto:?subject=Audio%20Diagnostic%20Analytics&body=${encodedText}`
    };

    if (sharingEndpoints[platform]) {
      window.open(sharingEndpoints[platform], "_blank", "noopener,noreferrer");
    }
  };

  const handleSaveFile = (type) => {
    const reportText = generateExportText();
    const targetName = file?.name || persistedFileMeta?.name || "Audio_Report";
    
    if (type === "txt") {
      const element = document.createElement("a");
      const fileBlob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
      element.href = URL.createObjectURL(fileBlob);
      element.download = `${targetName.split('.')[0]}_Metrics_${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else if (type === "pdf") {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Audio Diagnostic System Report</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; background-color: #ffffff; }
              .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }
              .title { font-size: 24px; font-weight: 700; color: #1e3a8a; }
              .meta { font-size: 13px; color: #64748b; margin-top: 4px; }
              .section-block { margin-bottom: 20px; padding: 16px; background: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 4px; }
              .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; tracking: 0.05em; color: #4f46e5; margin-bottom: 6px; }
              .content { font-size: 15px; color: #334155; white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">Audio Diagnostic Report</div>
              <div class="meta">Generated via Engine Core Analytics System • ${new Date().toLocaleString()}</div>
            </div>
            <div class="section-block">
              <div class="section-title">Target Metadata</div>
              <div class="content">File Signature: ${targetName}</div>
            </div>
            <div class="section-block">
              <div class="section-title">Acoustic Pitch Profile</div>
              <div class="content">${result?.analysis?.pitch}</div>
            </div>
            <div class="section-block">
              <div class="section-title">Grammar Analysis Matrix</div>
              <div class="content">${result?.analysis?.grammar_issues_found}</div>
            </div>
            <div class="section-block">
              <div class="section-title">Speech-To-Text Transcription</div>
              <div class="content">"${result?.analysis?.transcription}"</div>
            </div>
            <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // UI state computed values to see if we have valid data active
  const hasActiveData = result !== null;
  const currentFileName = file?.name || persistedFileMeta?.name;
  const currentFileSize = file?.size || persistedFileMeta?.size;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 antialiased font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-10">
        
        <header className="text-center max-w-3xl mx-auto space-y-6 select-none">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-indigo-400 backdrop-blur-xl shadow-sm">
            <Sparkles size={18} className="text-indigo-400 shrink-0" />
            <span className="font-mono text-xs tracking-widest uppercase font-semibold text-slate-400">
              Engine Core System <span className="text-indigo-400 text-semibold">#WeStudy</span>
            </span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Audio Analyzer
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-normal leading-relaxed">
              Upload production audio metrics to systematically track vocal signatures, phonetic syntax configurations, and real-time processing data layouts.
            </p>
          </div>
        </header>

        <main className="space-y-6 w-full">
          {/* Intake Module */}
          <section className="bg-slate-900/30 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-white tracking-tight">Audio Asset Intake</h3>
                <p className="text-xs text-slate-500">Provide high-fidelity targets for computational mapping diagnostics.</p>
              </div>
              {hasActiveData && (
                <button
                  onClick={resetUploader}
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
                onChange={handleFileChange}
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
                        "{LOADING_FACTS[factIndex]}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`p-4 rounded-xl transition-all shadow-sm ${currentFileName ? "bg-indigo-600 text-white scale-105" : "bg-slate-900 text-slate-500 group-hover:text-slate-300"}`}>
                      <FileAudio size={24} />
                    </div>
                    <div className="text-center mt-4 space-y-1 max-w-[90%]">
                      <span className="font-semibold text-sm block text-slate-200 truncate">
                        {currentFileName ? currentFileName : "Select raw audio component track"}
                      </span>
                      <span className="text-xs text-slate-500 block">
                        {currentFileSize ? `${(currentFileSize / (1024 * 1024)).toFixed(2)} MB` : "Accepts WAV, MP3, or M4A architecture structures"}
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
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full py-3.5 px-6 rounded-xl font-bold tracking-wide text-xs md:text-sm flex items-center justify-center gap-2 transition-all
                  ${!file || uploading
                    ? "bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-800/40"
                    : "bg-white text-slate-950 hover:bg-slate-200 active:scale-[0.99] shadow-md font-semibold"
                  }`}
              >
                {uploading ? "Analyzing Ingestion Pipeline..." : "Execute Core Signal Diagnosis"}
              </button>
            )}
          </section>

          {/* Clean Output Section */}
          {hasActiveData && (
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

              {/* Action Toolbar Component */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl text-sm">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 font-mono tracking-wider flex items-center gap-1.5 uppercase">
                    <Share2 size={12} /> Share Output Metrics
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {navigator.share && (
                      <button onClick={() => handleShare("native")} className="px-2.5 py-1 text-xs rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">
                        System Share
                      </button>
                    )}
                    <button onClick={() => handleShare("whatsapp")} className="px-2.5 py-1 text-xs rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 transition-colors">
                      WhatsApp
                    </button>
                    <button onClick={() => handleShare("telegram")} className="px-2.5 py-1 text-xs rounded-lg bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 border border-sky-500/20 transition-colors">
                      Telegram
                    </button>
                    <button onClick={() => handleShare("email")} className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1">
                      <Mail size={10} /> Email
                    </button>
                  </div>
                </div>

                <div className="space-y-2 md:border-l md:border-slate-800/80 md:pl-4">
                  <span className="text-xs font-semibold text-slate-500 font-mono tracking-wider flex items-center gap-1.5 uppercase">
                    <Download size={12} /> Local Export Engine
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => handleSaveFile("txt")} className="px-3 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400 transition-colors font-mono">
                      Export .txt
                    </button>
                    <button onClick={() => handleSaveFile("pdf")} className="px-3 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-rose-400 transition-colors font-mono">
                      Print .pdf
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pitch Data Card */}
                <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800/60 space-y-2 relative group hover:border-slate-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Activity size={16} className="shrink-0" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Acoustic Pitch Profile</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.analysis.pitch, "pitch")}
                      className="text-slate-500 hover:text-indigo-400 p-1.5 rounded bg-slate-900 border border-slate-800/80 transition-all"
                    >
                      {copiedField === "pitch" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <p className="text-base font-semibold text-slate-200 leading-relaxed">
                    {result.analysis.pitch}
                  </p>
                </div>

                {/* Grammar Data Card */}
                <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800/60 space-y-2 relative group hover:border-slate-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Type size={16} className="shrink-0" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Grammar Core Evaluation</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.analysis.grammar_issues_found, "grammar")}
                      className="text-slate-500 hover:text-indigo-400 p-1.5 rounded bg-slate-900 border border-slate-800/80 transition-all"
                    >
                      {copiedField === "grammar" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <p className="text-base font-semibold text-slate-200 leading-relaxed">
                    {result.analysis.grammar_issues_found}
                  </p>
                </div>
              </div>

              {/* Transcription Area Card */}
              <div className="p-5 rounded-xl bg-slate-950/30 border border-slate-800/60 space-y-2 relative group hover:border-slate-800 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Decoded Transcript Processing Output</span>
                  <button
                    onClick={() => copyToClipboard(result.analysis.transcription, "transcription")}
                    className="text-slate-500 hover:text-indigo-400 p-1.5 rounded bg-slate-900 border border-slate-800/80 transition-all"
                  >
                    {copiedField === "transcription" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
                <p className="text-slate-200 leading-relaxed font-normal text-base border-l-2 border-indigo-500/40 pl-4 py-0.5 bg-slate-950/10 rounded-r-lg">
                  "{result.analysis.transcription}"
                </p>
              </div>

            </section>
          )}
        </main>
      </div>
    </div>
  );
}