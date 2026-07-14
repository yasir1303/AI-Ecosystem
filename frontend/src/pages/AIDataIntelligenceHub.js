// frontend/src/pages/AIDataIntelligenceHub.js
import React, { useState, useRef } from "react";

export default function AIDataIntelligenceHub() {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [summary, setSummary] = useState("");
  const [kpis, setKpis] = useState({});
  const [datasetType, setDatasetType] = useState("");
  const [selectedGraph, setSelectedGraph] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const [graphs, setGraphs] = useState([]);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  const LANG_OPTIONS = [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "ar", label: "Arabic" },
    { code: "fr", label: "French" },
    { code: "es", label: "Spanish" },
  ];

  const processFileLocally = (file) => {
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        const lines = content.trim().split("\n").filter(Boolean);
        if (lines.length === 0) {
          setError("Empty file.");
          return;
        }
        const header = lines[0].split(",").map((c) => c.trim());
        const rowCount = Math.max(0, lines.length - 1);
        setDatasetInfo({
          fileName: file.name,
          rows: rowCount,
          columns: header.length,
          columnNames: header,
        });
      } catch (err) {
        setError("Failed to read file locally.");
        setTimeout(() => setError(""), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (
      !file.name.toLowerCase().endsWith(".csv") &&
      !/\.(xlsx|xls|json)$/i.test(file.name)
    ) {
      setError("Unsupported file format. Use CSV / XLSX / JSON.");
      setTimeout(() => setError(""), 4000);
      return;
    }
    processFileLocally(file);
    fileInputRef.current = e.currentTarget;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (
        !file.name.toLowerCase().endsWith(".csv") &&
        !/\.(xlsx|xls|json)$/i.test(file.name)
      ) {
        setError("Unsupported file format. Use CSV / XLSX / JSON.");
        setTimeout(() => setError(""), 4000);
        return;
      }
      processFileLocally(file);
      const dt = new DataTransfer();
      dt.items.add(file);
      const input = document.getElementById("file-input");
      if (input) input.files = dt.files;
    }
  };

  const handleAnalyzeData = async () => {
    const inputEl = document.getElementById("file-input");
    const files =
      (inputEl && inputEl.files && inputEl.files.length > 0 && inputEl.files) ||
      (fileInputRef.current && fileInputRef.current.files) ||
      null;

    if (!files || files.length === 0) {
      setError("Please choose a file to analyze.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    const file = files[0];
    setIsAnalyzing(true);
    setError("");
    setSummary("");
    setKpis({});
    setGraphs([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://127.0.0.1:5000/dataintelligence", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error || `Server error: ${res.status}`;
        throw new Error(msg);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      setDatasetType(data.dataset_type || "");
      if (data.summary) {
        setDatasetInfo({
          fileName: (file && file.name) || "uploaded_dataset",
          rows: data.summary.rows,
          columns: data.summary.cols,
          columnNames: data.summary.columns || [],
        });
      }

      setSummary(data.ai_summary || "No summary returned by server.");
      setKpis(data.kpi_data || {});
      const baseUrl = "http://127.0.0.1:5000";
      const images = (data.graphs || []).map((p) => baseUrl + p + `?t=${Date.now()}`);
      setGraphs(images);

      setIsAnalyzing(false);
    } catch (err) {
      console.error("Analyze error:", err);
      setError(err.message || "Analysis failed. Check backend.");
      setIsAnalyzing(false);
      setTimeout(() => setError(""), 6000);
    }
  };

  const handleClearData = () => {
    const input = document.getElementById("file-input");
    if (input) {
      input.value = "";
    }
    fileInputRef.current = null;
    setDatasetInfo(null);
    setSummary("");
    setKpis({});
    setGraphs([]);
    setError("");
  };

  const handleReadSummary = async () => {
    if (!summary) return;
    setIsPlaying(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/translate/text/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: summary, target: selectedLanguage }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play().catch(() => {
            const a = new Audio(url);
            a.play().catch(() => speakViaWebSpeech(summary, selectedLanguage));
          });
        } else {
          const a = new Audio(url);
          a.play().catch(() => speakViaWebSpeech(summary, selectedLanguage));
        }
      } else {
        speakViaWebSpeech(summary, selectedLanguage);
      }
    } catch (err) {
      console.warn("TTS fallback:", err);
      speakViaWebSpeech(summary, selectedLanguage);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      window.speechSynthesis.cancel();
    } catch (e) {}
  };

  const speakViaWebSpeech = (text, langCode) => {
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = langCode || "en-US";
      utter.rate = 1;
      utter.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn("WebSpeech error", e);
      setError("Audio unavailable in this browser.");
      setTimeout(() => setError(""), 3000);
      setIsPlaying(false);
    }
  };

  const handleDownloadReport = () => {
    window.open("http://127.0.0.1:5000/download_report", "_blank");
  };

  const prettifyKey = (k) =>
    String(k).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <style>{`
        body {
          background: linear-gradient(135deg, #dffeff 0%, #d4f5ff 50%, #cafff8 100%);
          min-height: 100vh;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        .kpi-chip { background: linear-gradient(135deg, rgba(0,224,216,0.08), rgba(0,181,181,0.06)); border: 1px solid rgba(0,224,216,0.18); box-shadow: 0 6px 20px rgba(0,224,216,0.06); }
        .kpi-chip:hover { box-shadow: 0 10px 30px rgba(0,224,216,0.12); transform: translateY(-3px); }
      `}</style>

      <div className="flex items-center justify-center min-h-screen p-4 pt-12">
        <div className="w-full max-w-4xl mx-auto">
          <button
            onClick={() => window.history.back()}
            className="mb-6 p-3 rounded-full bg-gradient-to-r from-amber-200/60 to-yellow-200/60 backdrop-blur-sm border border-amber-200/40 shadow-lg hover:scale-110 transition-transform duration-300"
            aria-label="Go back"
          >
            <span className="text-xl">←</span>
          </button>

          <div className="backdrop-blur-xl bg-white/60 rounded-3xl border border-white/40 shadow-2xl p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 inline-block bg-gradient-to-r from-[#00b5b5] via-[#009090] to-[#008080] bg-clip-text text-transparent">
                📊 AI Data Intelligence Hub
              </h1>
              <p className="text-lg text-[#00a8a8] font-medium">
                Upload your dataset to uncover AI-driven insights, KPIs, and visual analytics.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-100/60 border border-red-300/40 backdrop-blur-sm animate-fade-in">
                <p className="text-red-700 font-medium text-sm">⚠️ {error}</p>
              </div>
            )}

            {!datasetInfo ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mb-8 p-8 rounded-3xl border-2 border-dashed backdrop-blur-sm transition-all duration-300 ${
                  isDragging ? "border-[#00e0d8] bg-[#00e0d8]/10 shadow-lg" : "border-[#00e0d8]/50 bg-white/40 hover:bg-white/60"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="text-5xl">📁</div>
                  <div className="text-center">
                    <p className="text-gray-900 font-bold text-lg mb-1">Drag and drop your file</p>
                    <p className="text-gray-600 text-sm">CSV, XLSX, or JSON (recommended CSV)</p>
                  </div>

                  <input id="file-input" type="file" accept=".csv,.xlsx,.xls,.json" onChange={handleFileSelect} className="hidden" />
                  <label htmlFor="file-input" className="cursor-pointer px-6 py-3 rounded-full bg-gradient-to-r from-[#00e0d8] via-[#00b5b5] to-[#009e9e] text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Browse Files
                  </label>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-2xl bg-white/60 border border-[#00e0d8]/40 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <p className="font-bold text-gray-900">{datasetInfo.fileName}</p>
                      <p className="text-xs text-gray-600">{datasetInfo.rows} rows × {datasetInfo.columns} columns</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={handleClearData} className="px-4 py-2 rounded-full bg-red-200/60 hover:bg-red-300/80 border border-red-200/40 text-red-700 font-semibold text-sm transition-all duration-300 hover:scale-105">
                      🗑 Clear
                    </button>
                    <button onClick={handleAnalyzeData} disabled={isAnalyzing} className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00e0d8] via-[#00b5b5] to-[#009e9e] text-white font-bold hover:scale-105 transition-all shadow-lg">
                      {isAnalyzing ? "⚙️ Analyzing..." : "🔍 Analyze Data"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {datasetInfo && (
              
              <div className="mb-8 p-6 rounded-3xl backdrop-blur-sm bg-white/40 border border-white/40 shadow-lg animate-fade-in">
                <h3 className="text-xl font-bold text-[#00b5b5] mb-4 flex items-center gap-2"><span>📁</span> Dataset Info</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Rows</p>
                    <p className="text-2xl font-bold text-gray-900">{datasetInfo.rows}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Columns</p>
                    <p className="text-2xl font-bold text-gray-900">{datasetInfo.columns}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-2">Column Names</p>
                  <div className="flex flex-wrap gap-2">
                    {datasetInfo.columnNames.map((col, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-gradient-to-r from-[#00e0d8]/20 to-[#00b5b5]/20 text-[#009090] text-xs font-semibold border border-[#00e0d8]/30">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {summary && (
              <div className="mb-8 p-6 rounded-3xl backdrop-blur-sm bg-white/40 border border-white/40 shadow-lg animate-fade-in">
                <h3 className="text-xl font-bold text-[#00b5b5] mb-4 flex items-center gap-2"><span>🧠</span> AI Summary</h3>
                <p className="text-gray-800 leading-relaxed font-medium text-base mb-6">{summary}</p>
                 {datasetType && (
  <p className="text-sm font-semibold text-[#009090] mt-1">
    Dataset Type: {datasetType}
  </p>
)}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.keys(kpis).length === 0 ? (
                    <p className="text-sm text-gray-500">No KPIs found.</p>
                  ) : (
                    Object.entries(kpis).map(([key, val]) => (
                      <div key={key} className="kpi-chip p-4 rounded-2xl transition-all duration-300">
                        <p className="text-xs text-gray-600 font-medium mb-1">{prettifyKey(key)}</p>
                        <p className="text-lg font-bold text-[#009090]">{val}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
         


            {summary && (
              <div className="mb-8 p-6 rounded-3xl backdrop-blur-sm bg-white/40 border border-white/40 shadow-lg animate-fade-in">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Language</label>
                  <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="w-full p-3 rounded-full border border-[#00e0d8] bg-white/80 text-gray-900 font-medium">
                    {LANG_OPTIONS.map((opt) => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button onClick={handleReadSummary} className="py-3 px-4 rounded-full bg-gradient-to-r from-[#00e0d8] via-[#00b5b5] to-[#009e9e] text-white font-bold transition-all transform hover:scale-105 shadow-lg text-sm">
                    🔊 Read
                  </button>
                  <button onClick={handleStop} className="py-3 px-4 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold transition-all transform hover:scale-105 shadow-lg text-sm">
                    ⏹ Stop
                  </button>
                  <button onClick={handleDownloadReport} className="py-3 px-4 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 text-gray-900 font-bold transition-all transform hover:scale-105 shadow-lg text-sm">
                    📥 Report
                  </button>
                </div>

                <audio ref={audioRef} hidden />
              </div>
            )}

            {graphs.length > 0 && (
              <div className="p-6 rounded-3xl backdrop-blur-sm bg-white/40 border border-white/40 shadow-lg animate-fade-in">
                <h3 className="text-xl font-bold text-[#00b5b5] mb-4 flex items-center gap-2"><span>📈</span> Visual Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {graphs.map((src, i) => (
                    <div key={i} className="h-64 rounded-2xl bg-white/60 border border-[#00e0d8]/30 flex items-center justify-center overflow-hidden p-2">
                      <img
  src={src}
  alt={`chart-${i}`}
  className="w-full h-full object-contain cursor-pointer hover:scale-105 transition"
  onClick={() => setSelectedGraph(src)}
/>

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedGraph && (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
    <div className="relative bg-white rounded-2xl p-4 max-w-5xl w-full mx-4">
      
      {/* Close button */}
      <button
        onClick={() => setSelectedGraph(null)}
        className="absolute top-3 right-3 text-xl bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
      >
        ✕
      </button>

      {/* Big image */}
      <img
        src={selectedGraph}
        alt="Expanded Chart"
        className="w-full max-h-[80vh] object-contain"
      />
    </div>
  </div>
)}

    </div>
  );
}
