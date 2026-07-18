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
    <div className="min-h-screen bg-[#030712] text-slate-100 antialiased font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Premium Ambient Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 space-y-16">
        
        {/* Premium Minimal Header Assembly */}
        <header className="text-center max-w-4xl mx-auto space-y-8 select-none">
          
          {/* Enhanced Bold Micro-Badge Assembly */}
          <div className="inline-flex items-center gap-4 px-6 py-2 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-indigo-400 backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
            <Sparkles size={22} className="text-indigo-400 animate-pulse shrink-0" />
            <h2 className="font-mono text-xl sm:text-2xl md:text-3xl tracking-[0.25em] font-light text-slate-400  leading-none">
              𝔈𝔫𝔤𝔦𝔫𝔢 ℭ𝔬𝔯𝔢 <span className="font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">#𝔚𝔢𝔑𝔖𝔱𝔲𝔡𝔶</span>
            </h2>
          </div>
          
          {/* Premium High-Contrast Typography Stack */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white via-slate-200 to-slate-500/60 bg-clip-text text-transparent leading-[0.95] py-1">
              ǟʊɖɨօ ǟռǟʟʏʐɛʀ
            </h1>
            <p className="text-slate-400 text-sm sm:text-base md:text-lg font-normal leading-relaxed max-w-xl mx-auto tracking-wide">
              𝚄𝚙𝚕𝚘𝚊𝚍 𝚢𝚘𝚞𝚛 𝚛𝚊𝚠 𝚊𝚞𝚍𝚒𝚘 𝚏𝚒𝚕𝚎𝚜 𝚝𝚘 𝚒𝚗𝚜𝚝𝚊𝚗𝚝𝚕𝚢 𝚍𝚎𝚌𝚘𝚍𝚎 𝚟𝚘𝚌𝚊𝚕 𝚙𝚒𝚝𝚌𝚑, 𝚜𝚝𝚛𝚞𝚌𝚝𝚞𝚛𝚊𝚕 𝚏𝚕𝚘𝚠 𝚌𝚘𝚗𝚏𝚒𝚐𝚞𝚛𝚊𝚝𝚒𝚘𝚗𝚜, 𝚊𝚗𝚍 𝚜𝚢𝚗𝚝𝚊𝚡 𝚊𝚗𝚊𝚕𝚢𝚝𝚒𝚌𝚜.
            </p>
          </div>
        </header>

        {/* Dynamic Dual-Column Split Grid */}
        <main className={`grid gap-8 items-start transition-all duration-500 ${result ? "lg:grid-cols-2" : "max-w-xl mx-auto w-full"}`}>
          
          {/* Input Panel (Upload Control) */}
          <section className="bg-slate-900/40 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-800 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.5)] space-y-6 transition-all duration-300 hover:border-slate-700/50">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">𝙰𝚞𝚍𝚒𝚘 𝙸𝚗𝚝𝚊𝚔𝚎</h3>
              <p className="text-s text-slate-400">𝙿𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚑𝚒𝚐𝚑-𝚏𝚒𝚍𝚎𝚕𝚒𝚝𝚢 𝚖𝚎𝚍𝚒𝚊 𝚝𝚊𝚛𝚐𝚎𝚝 𝚏𝚘𝚛 𝚜𝚢𝚜𝚝𝚎𝚖 𝚍𝚒𝚊𝚐𝚗𝚘𝚜𝚝𝚒𝚌𝚜.</p>
            </div>

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
                className={`group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 md:p-12 cursor-pointer transition-all duration-300
                  ${
                    file
                      ? "border-indigo-500/40 bg-indigo-950/10 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]"
                      : "border-slate-800 bg-slate-950/40 hover:bg-slate-950/60 hover:border-slate-700"
                  }`}
              >
                <div
                  className={`p-4 rounded-xl transition-all duration-300 shadow-md ${
                    file
                      ? "bg-indigo-600 text-white shadow-indigo-950/50 scale-105"
                      : "bg-slate-900 text-slate-400 group-hover:text-slate-200 group-hover:scale-105"
                  }`}
                >
                  {file ? <FileAudio size={28} /> : <Upload size={28} />}
                </div>

                <div className="text-center mt-5 space-y-1 max-w-[85%]">
                  <span className="font-semibold text-sm block text-slate-200 group-hover:text-white transition-colors truncate">
                    {file ? file.name : "𝒮𝑒𝓁𝑒𝒸𝓉 𝑜𝓇 𝒹𝓇𝑜𝓅 𝒶𝓊𝒹𝒾𝑜 𝓉𝓇𝒶𝒸𝓀"}
                  </span>
                  <span className="text-xs text-slate-500 block font-medium tracking-wide">
                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "WAV, MP3, or M4A assets"}
                  </span>
                </div>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3 text-xs md:text-sm animate-in fade-in duration-200">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold tracking-wide text-sm flex items-center justify-center gap-2.5 transition-all duration-300
                ${
                  !file || uploading
                    ? "bg-slate-800/40 text-slate-500 cursor-not-allowed border border-slate-800/50"
                    : "bg-white text-slate-950 hover:bg-slate-200 active:scale-[0.99] font-bold shadow-xl shadow-white/5"
                }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin text-slate-950" size={16} />
                  <span>ᴾʳᵒᶜᵉˢˢⁱⁿᵍ ⱽᵒⁱᶜᵉ ᴬʳʳᵃʸˢ...</span>
                </>
              ) : (
                "𝑅𝓊𝓃 𝒞𝑜𝓇𝑒 𝒜𝓃𝒶𝓁𝓎𝓈𝒾𝓈"
              )}
            </button>
          </section>

          {/* Output Panel (Results Matrix) */}
          {result && (
            <section className="bg-slate-900/40 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-indigo-500/20 shadow-[0_24px_60px_-15px_rgba(99,102,241,0.08)] space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle size={18} />
                  <h3 className="text-lg font-bold tracking-tight text-white">𝕯𝖎𝖆𝖌𝖓𝖔𝖘𝖙𝖎𝖈𝖘 𝕮𝖔𝖒𝖕𝖑𝖊𝖙𝖊</h3>
                </div>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800/60">
                  #𝙾𝚄𝚃𝙿𝚄𝚃
                </span>
              </div>

              {/* Data Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Activity size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/80">𝒜𝒸𝑜𝓊𝓈𝓉𝒾𝒸 𝒫𝒾𝓉𝒸𝒽</span>
                  </div>
                  <p className="text-sm font-medium text-slate-200 leading-relaxed">
                    {result.analysis.pitch}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Type size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/80">ɠ૨αɱɱα૨ ૮σ૨ε</span>
                  </div>
                  <p className="text-sm font-medium text-slate-200 leading-relaxed">
                    {result.analysis.grammar_issues_found}
                  </p>
                </div>
              </div>

              {/* Transcription Output */}
              <div className="p-5 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">ɖɛƈօɖɛɖ ȶʀǟռֆƈʀɨքȶɨօռ</span>
                <p className="text-slate-300 leading-relaxed font-normal text-sm md:text-base border-l-2 border-indigo-500/40 pl-3 py-0.5">
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