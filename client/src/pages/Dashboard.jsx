import React, { useState } from 'react';
import { Upload, FileAudio, Loader2, CheckCircle, AlertCircle, Activity, Type } from 'lucide-react';

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
        setResult(null);
        setError('');
      } else {
        setError('Please select a valid audio file (e.g., MP3, WAV).');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    // FormData is required to send files over HTTP
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Ensure this URL matches your FastAPI server's address and port
      const response = await fetch('http://127.0.0.1:8000/api/analyze-audio', {
        method: 'POST',
        body: formData,
        // Note: Do NOT set 'Content-Type' header here. 
        // The browser automatically sets it to 'multipart/form-data' with the correct boundary.
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Could not connect to the server. Is FastAPI running?');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Audio Analyzer</h1>
          <p className="text-slate-500">Upload a recording to extract pitch and grammar insights.</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 hover:bg-slate-100 transition-colors">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
              id="audio-upload"
            />
            <label
              htmlFor="audio-upload"
              className="flex flex-col items-center cursor-pointer space-y-4"
            >
              <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                {file ? <FileAudio size={32} /> : <Upload size={32} />}
              </div>
              <div className="text-center">
                <span className="font-semibold text-slate-700">
                  {file ? file.name : 'Click to select audio file'}
                </span>
                <p className="text-sm text-slate-500 mt-1">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Supports MP3, WAV, M4A'}
                </p>
              </div>
            </label>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full mt-6 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all
              ${!file || uploading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Analyzing Audio...
              </>
            ) : (
              'Analyze Recording'
            )}
          </button>
        </div>

        {/* Results Card */}
        {result && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 text-green-600 mb-6">
              <CheckCircle size={24} />
              <h2 className="text-xl font-semibold">Analysis Complete</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Activity size={18} />
                  <span className="text-sm font-medium">Acoustic Pitch</span>
                </div>
                <p className="font-semibold text-lg">{result.analysis.pitch}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Type size={18} />
                  <span className="text-sm font-medium">Grammar Issues</span>
                </div>
                <p className="font-semibold text-lg">{result.analysis.grammar_issues_found} detected</p>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-sm font-medium text-slate-500">Transcription</span>
              <p className="text-slate-700 italic">"{result.analysis.transcription}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}