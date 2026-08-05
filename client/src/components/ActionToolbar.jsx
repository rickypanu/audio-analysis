import React, { useState, useEffect } from "react";
import { Share2, Download, FileText } from "lucide-react";
import { jsPDF } from "jspdf";

export default function ActionToolbar({ 
  onShare, 
  onSaveFile, 
  metricsData,
  shareData = { title: "Diagnostics", text: "Check out this diagnostic output", url: typeof window !== "undefined" ? window.location.href : "" } 
}) {
  const [isShareSupported, setIsShareSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (onShare) onShare("native");
      } catch (error) {
        if (error.name !== "AbortError") console.error("Error sharing:", error);
      }
    } else {
      alert("System share is not supported on this browser.");
    }
  };

  const handleSocialShare = (platform) => {
    const text = encodeURIComponent(`${shareData.text} - ${shareData.url}`);
    let url = "";

    if (platform === "whatsapp") {
      url = `https://api.whatsapp.com/send?text=${text}`;
    } else if (platform === "telegram") {
      url = `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`;
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      if (onShare) onShare(platform);
    }
  };

  const createPDFDocument = () => {
    const doc = new jsPDF();
    const title = metricsData?.title || "Diagnostics Report";
    const summary = metricsData?.summary || "No transcription summary available.";
    const stats = metricsData?.stats || [];

    // Header Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); 
    doc.text(title, 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); 
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 26);

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(20, 32, 190, 32);

    // Metrics / Key Values Breakdown
    let cursorY = 42;
    if (stats.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text("Telemetry Overview", 20, cursorY);
      cursorY += 8;

      doc.setFontSize(9);
      stats.forEach((item, index) => {
        if (cursorY > 275) {
          doc.addPage();
          cursorY = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 65, 85);
        doc.text(`${index + 1}. ${item.label}:`, 20, cursorY);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        const splitVal = doc.splitTextToSize(String(item.value || "N/A"), 110);
        doc.text(splitVal, 80, cursorY);
        
        cursorY += (splitVal.length * 6) + 4;
      });
    }

    // Transcription Summary Section
    cursorY += 5;
    if (cursorY > 260) {
      doc.addPage();
      cursorY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("Decoded Transcript / Summary", 20, cursorY);
    cursorY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const splitSummary = doc.splitTextToSize(summary, 170);
    doc.text(splitSummary, 20, cursorY);

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Exported securely via System Dashboard", 20, 285);

    return doc;
  };

  const handleGeneratePDF = () => {
    const doc = createPDFDocument();
    doc.save("diagnostics-report.pdf");
  };

  const handleSharePDF = async () => {
    const doc = createPDFDocument();
    const pdfBlob = doc.output("blob");
    const file = new File([pdfBlob], "diagnostics-report.pdf", { type: "application/pdf" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: "Diagnostics Report",
          text: "Here is the compiled diagnostics report PDF.",
          files: [file],
        });
        if (onShare) onShare("pdf");
      } catch (error) {
        if (error.name !== "AbortError") console.error("Error sharing PDF:", error);
      }
    } else {
      // Fallback if browser file sharing isn't supported
      alert("Direct file sharing is not supported on this browser. Downloading PDF instead.");
      doc.save("diagnostics-report.pdf");
    }
  };

  const handleExport = (type) => {
    if (type === "pdf") {
      handleGeneratePDF();
    }
    if (onSaveFile) {
      onSaveFile(type);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl text-sm">
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-500 font-mono tracking-wider flex items-center gap-1.5 uppercase">
          <Share2 size={12} /> Share Output Metrics
        </span>
        <div className="flex flex-wrap gap-1.5">
          {isShareSupported && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="px-2.5 py-1 text-xs rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
            >
              System Share
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSocialShare("whatsapp")}
            className="px-2.5 py-1 text-xs rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 transition-colors"
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => handleSocialShare("telegram")}
            className="px-2.5 py-1 text-xs rounded-lg bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 border border-sky-500/20 transition-colors"
          >
            Telegram
          </button>
          {isShareSupported && (
            <button
              type="button"
              onClick={handleSharePDF}
              className="px-2.5 py-1 text-xs rounded-lg bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/20 transition-colors flex items-center gap-1 font-mono"
            >
              <FileText size={10} /> Share PDF
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 md:border-l md:border-slate-800/80 md:pl-4">
        <span className="text-xs font-semibold text-slate-500 font-mono tracking-wider flex items-center gap-1.5 uppercase">
          <Download size={12} /> Local Export Engine
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleExport("txt")}
            className="px-3 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400 transition-colors font-mono"
          >
            Export .txt
          </button>
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            className="px-3 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-rose-400 transition-colors font-mono"
          >
            Print .pdf
          </button>
        </div>
      </div>
    </div>
  );
}