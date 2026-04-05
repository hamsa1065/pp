'use client';

import { useRef, useState } from 'react';

export default function UploadSection({
  file, onFileSelect, onDiagnose, onReset, loading, error, hasResult,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileSelect(dropped);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="animate-fade-up opacity-0 delay-600">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm">
          📁
        </div>
        <div>
          <h2 className="text-white font-semibold text-lg font-display">Upload Health Data</h2>
          <p className="text-gray-500 text-xs">Samsung Health export ZIP → AI risk assessment</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 sm:p-8">

        {/* Upload zone */}
        {!file ? (
          <div
            className={`upload-zone rounded-xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300
              ${isDragging ? 'dragover border-cyan-400 bg-cyan-500/5' : 'bg-navy-800/40'}`}
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="text-5xl sm:text-6xl mb-5 select-none">
              {isDragging ? '📂' : '📦'}
            </div>
            <p className="text-white font-semibold text-lg mb-2">
              {isDragging ? 'Drop it here!' : 'Drop your Samsung Health ZIP here'}
            </p>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
              Export from <span className="text-cyan-400">Samsung Health app</span> →
              My page → Settings → Download personal data
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-navy-900 font-semibold text-sm hover:opacity-90 transition-all hover:scale-105 active:scale-95"
            >
              <span>📂</span>
              Browse Files
            </button>
            <p className="text-gray-600 text-xs mt-4">
              Only .zip files · Max 100 MB · Your data never leaves your device
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
            />
          </div>
        ) : (
          /* File selected state */
          <div className="space-y-5">
            {/* File card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-2xl flex-shrink-0">
                🗜️
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{file.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">{formatSize(file.size)}</p>
              </div>
              <button
                onClick={() => { onReset(); inputRef.current?.click(); }}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-sm"
                title="Change file"
              >
                ✕
              </button>
            </div>

            {/* Data sources parsed */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Sleep', 'Heart Rate', 'Stress', 'SpO2', 'Skin Temp', 'Steps', 'HRV', 'Sleep Stages'].map((src) => (
                <div key={src} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 text-xs text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/70 flex-shrink-0"></span>
                  {src}
                </div>
              ))}
            </div>

            {/* Diagnose button */}
            <button
              onClick={onDiagnose}
              disabled={loading}
              className="w-full py-4 rounded-xl font-display font-semibold text-base tracking-wide transition-all duration-200
                bg-gradient-to-r from-cyan-500 to-violet-600 text-white
                hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
                shadow-lg shadow-cyan-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="spinner w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analysing...
                </span>
              ) : hasResult ? (
                '🔁  Re-run Diagnosis'
              ) : (
                '🧠  Run Diagnosis'
              )}
            </button>

            {/* Reset */}
            {hasResult && (
              <button
                onClick={onReset}
                className="w-full py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-600 transition-colors"
              >
                Upload different file
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* How to export guide */}
        <div className="mt-6 pt-6 border-t border-gray-800/60">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            How to export Samsung Health data
          </p>
          <ol className="space-y-1.5">
            {[
              'Open Samsung Health app on your phone',
              'Tap your profile → Settings (⚙️)',
              'Scroll to "Download personal data"',
              'Select all data → Request download',
              'Extract the ZIP and upload it here',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-gray-500">
                <span className="w-5 h-5 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center text-xs flex-shrink-0 font-medium mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
