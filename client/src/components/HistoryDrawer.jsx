import React from "react";
import { X, Trash2, Clock, FileAudio, ArrowUpRight, Loader2 } from "lucide-react";

export default function HistoryDrawer({
  isOpen,
  onClose,
  history,
  isLoadingHistory,
  onSelectHistory,
  onDeleteHistory,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl">
        <div className="space-y-6 overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-indigo-400" />
              <h3 className="font-bold text-white text-lg">Diagnostic History</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                <Loader2 size={28} className="animate-spin text-indigo-400" />
                <p className="text-sm font-medium">Fetching historical records...</p>
              </div>
            ) : !history || history.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm space-y-2">
                <FileAudio size={32} className="mx-auto text-slate-700" />
                <p>No historical runs stored yet.</p>
              </div>
            ) : (
              history.map((item) => {
                // Safe fallback for MongoDB _id vs serialized id
                const itemId = item.id || item._id;
                // Safe fallback for nested analysis transcription
                const transcription =
                  item.data?.analysis?.transcription ||
                  item.analysis?.transcription ||
                  "No transcription available";

                return (
                  <div
                    key={itemId}
                    className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/30 transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 truncate">
                        <p className="text-sm font-semibold text-slate-200 truncate">
                          {item.fileName || item.file_info?.filename || "Audio File"}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : "Just now"}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteHistory(itemId);
                        }}
                        className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 italic bg-slate-950/40 p-2 rounded border border-slate-800/50">
                      "{transcription}"
                    </p>

                    <button
                      onClick={() => {
                        onSelectHistory(item);
                        onClose();
                      }}
                      className="w-full mt-2 py-1.5 px-3 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      <span>Load Report</span>
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}