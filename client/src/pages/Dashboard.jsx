import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AudioIntake from "../components/AudioIntake";
import DiagnosticsOutput from "../components/DiagnosticsOutput";
import HistoryDrawer from "../components/HistoryDrawer";
import DetailedAnalysisView from "../components/DetailedAnalysisView";
import { analyzeAudio, fetchHistory, deleteHistoryApi } from "../services/api";
import { LOADING_FACTS } from "../utils/loadingFacts";

export default function Dashboard({ currentUser, onLogout }) {
  const [file, setFile] = useState(null);
  const [persistedFileMeta, setPersistedFileMeta] = useState(() => {
    const savedMeta = localStorage.getItem("audio_file_meta");
    return savedMeta ? JSON.parse(savedMeta) : null;
  });

  const [uploading, setUploading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [result, setResult] = useState(() => {
    const savedResult = localStorage.getItem("audio_analysis_result");
    return savedResult ? JSON.parse(savedResult) : null;
  });

  // History State
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem("audio_analysis_history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Inspection View State
  const [inspectedRecord, setInspectedRecord] = useState(null);

  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState(null);
  const [factIndex, setFactIndex] = useState(0);

  // Synchronize history with FastAPI backend on initial mount
  useEffect(() => {
    const syncBackendHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await fetchHistory();
        const rawList = Array.isArray(response)
          ? response
          : response?.history || response?.data || [];

        // Normalize backend documents while preserving full analysis payloads
        const validHistory = rawList
          .filter((item) => item && (item.id || item._id))
          .map((item) => {
            const rawAnalysis = item.data?.analysis || item.analysis || item.data || {};
            return {
              id: item.id || item._id,
              fileName:
                item.fileName ||
                item.file_info?.filename ||
                item.data?.file_info?.filename ||
                "Audio File",
              fileSize: item.fileSize || item.file_info?.size || null,
              timestamp: item.timestamp || item.created_at || new Date().toISOString(),
              data: {
                ...item.data,
                analysis: {
                  ...rawAnalysis,
                  transcription:
                    rawAnalysis.transcription || "No transcription available",
                  pitch: rawAnalysis.pitch || "N/A",
                  grammar_issues_found:
                    rawAnalysis.grammar_issues_found || "None",
                },
              },
            };
          });

        if (validHistory.length > 0) {
          setHistory(validHistory);
          localStorage.setItem(
            "audio_analysis_history",
            JSON.stringify(validHistory)
          );
        }
      } catch (err) {
        console.warn("History sync fallback to local cache:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    syncBackendHistory();
  }, []);

  // Loading facts rotation
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
        setInspectedRecord(null);
        setError("");
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
      const meta = { name: file.name, size: file.size };

      // Update current run
      localStorage.setItem("audio_analysis_result", JSON.stringify(data));
      localStorage.setItem("audio_file_meta", JSON.stringify(meta));
      setResult(data);
      setPersistedFileMeta(meta);

      // Append to History Log
      const historyRecord = {
        id: data.id || data._id || Date.now().toString(),
        fileName: file.name,
        fileSize: file.size,
        timestamp: new Date().toISOString(),
        data: data,
      };

      const updatedHistory = [historyRecord, ...history];
      setHistory(updatedHistory);
      localStorage.setItem(
        "audio_analysis_history",
        JSON.stringify(updatedHistory)
      );
    } catch (err) {
      setError(
        err.message || "Could not connect to the server. Is the backend awake?"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSelectHistoryItem = (historyRecord) => {
    setInspectedRecord(historyRecord);
    setIsHistoryOpen(false);
  };

  const handleDeleteHistoryItem = async (id) => {
    // Optimistic UI update
    const filtered = history.filter((item) => (item.id || item._id) !== id);
    setHistory(filtered);
    localStorage.setItem("audio_analysis_history", JSON.stringify(filtered));

    if ((inspectedRecord?.id || inspectedRecord?._id) === id) {
      setInspectedRecord(null);
    }

    // Sync deletion with FastAPI backend
    try {
      if (typeof deleteHistoryApi === "function") {
        await deleteHistoryApi(id);
      }
    } catch (err) {
      console.error("Failed to delete record on backend:", err);
    }
  };

  const resetUploader = () => {
    setFile(null);
    setPersistedFileMeta(null);
    setResult(null);
    setInspectedRecord(null);
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

  const generateExportText = (activeData, targetFileName) => {
    const analysis = activeData?.analysis || activeData || {};
    return `Audio Diagnostics Report\nTarget File: ${targetFileName}\n\n1. Acoustic Pitch Analysis:\n${
      analysis?.pitch || "N/A"
    }\n\n2. Grammar Systems Check:\n${
      analysis?.grammar_issues_found || "None"
    }\n\n3. Decoded Speech Transcription:\n"${
      analysis?.transcription || "N/A"
    }"`;
  };

  const handleShare = async (platform, customData, customName) => {
    const activeData = customData || result;
    const activeName =
      customName || file?.name || persistedFileMeta?.name || "Unknown Track";
    const reportText = generateExportText(activeData, activeName);

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
      telegram: `https://t.me/share/url?url=${encodeURIComponent(
        window.location.href
      )}&text=${encodedText}`,
      email: `mailto:?subject=Audio%20Diagnostic%20Analytics&body=${encodedText}`,
    };

    if (sharingEndpoints[platform]) {
      window.open(sharingEndpoints[platform], "_blank", "noopener,noreferrer");
    }
  };

  const handleSaveFile = (type, customData, customName) => {
    const activeData = customData || result;
    const activeName =
      customName || file?.name || persistedFileMeta?.name || "Audio_Report";
    const reportText = generateExportText(activeData, activeName);

    if (type === "txt") {
      const element = document.createElement("a");
      const fileBlob = new Blob([reportText], {
        type: "text/plain;charset=utf-8",
      });
      element.href = URL.createObjectURL(fileBlob);
      element.download = `${activeName.split(".")[0]}_Metrics_${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const hasActiveData = result !== null;
  const currentFileName = file?.name || persistedFileMeta?.name;
  const currentFileSize = file?.size || persistedFileMeta?.size;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 antialiased font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-10">
        <Header
          user={currentUser}
          onLogout={onLogout}
          onToggleHistory={() => setIsHistoryOpen(true)}
          historyCount={history.length}
        />

        <main className="space-y-6 w-full">
          {inspectedRecord ? (
            <DetailedAnalysisView
              selectedRecord={inspectedRecord}
              copiedField={copiedField}
              onBack={() => setInspectedRecord(null)}
              onCopy={copyToClipboard}
              onShare={(platform) =>
                handleShare(
                  platform,
                  inspectedRecord.data,
                  inspectedRecord.fileName
                )
              }
              onSaveFile={(type) =>
                handleSaveFile(
                  type,
                  inspectedRecord.data,
                  inspectedRecord.fileName
                )
              }
            />
          ) : (
            <>
              <AudioIntake
                file={file}
                currentFileName={currentFileName}
                currentFileSize={currentFileSize}
                uploading={uploading}
                loadingFact={LOADING_FACTS[factIndex]}
                error={error}
                hasActiveData={hasActiveData}
                onFileChange={handleFileChange}
                onUpload={handleUpload}
                onReset={resetUploader}
              />

              {hasActiveData && (
                <DiagnosticsOutput
                  result={result}
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                  onShare={(platform) => handleShare(platform)}
                  onSaveFile={(type) => handleSaveFile(type)}
                />
              )}
            </>
          )}
        </main>
      </div>

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        isLoadingHistory={isLoadingHistory}
        onSelectHistory={handleSelectHistoryItem}
        onDeleteHistory={handleDeleteHistoryItem}
      />
    </div>
  );
}