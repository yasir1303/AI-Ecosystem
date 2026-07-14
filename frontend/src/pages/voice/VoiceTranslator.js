import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Volume2, Copy } from "lucide-react";
import { languages } from "../../App";
import "./voice.css";

export default function VoiceTranslator() {
  const navigate = useNavigate();

  const [voiceLang, setVoiceLang] = useState("hi");
  const [sourceLang, setSourceLang] = useState("hi");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
  const saved = localStorage.getItem("voiceHistory");
  return saved ? JSON.parse(saved) : [];
});
React.useEffect(() => {
  const saved = localStorage.getItem("lastVoiceResult");
  if (saved) setResult(JSON.parse(saved));
}, []);



  const handleVoiceTranslate = async () => {
    try {
      setLoading(true);
      setResult(null);

      const response = await fetch("http://127.0.0.1:5000/translate/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  source: sourceLang,   // 👈 THIS FIXES EVERYTHING
  target: voiceLang
}),

      });

      const data = await response.json();

      if (data.error) {
        alert("Voice translation failed");
        setLoading(false);
        return;
      }

      // Create audio playable URL
      const fullAudioURL = "http://127.0.0.1:5000" + data.audio_url;

      const finalData = {
  original: data.original_text,
  translated: data.translated_text,
  emotion: data.emotion,
  audio: fullAudioURL,
  detectedLang: sourceLang, // 🔥 SOURCE (auto-detected)
  targetLang: voiceLang,            // 🎯 TARGET (selected)
  time: new Date().toLocaleTimeString(),
};


      setResult(finalData);
      localStorage.setItem("lastVoiceResult", JSON.stringify(finalData));


      // Update history
      const updated = [finalData, ...history];
      setHistory(updated);
      localStorage.setItem("voiceHistory", JSON.stringify(updated));


    } catch (err) {
      console.error(err);
      alert("Error while processing voice.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Clear all history?")) {
      setHistory([]);
      sessionStorage.removeItem("voiceHistory");
    }
  };

  return (
    <div className="voice-page">
      <div className="voice-container">

        {/* Back */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          ⬅ Back
        </button>

        <h1 className="title">🎙️ Voice Translator</h1>
        <p className="subtitle">Speak → Auto Translate → Listen</p>
        {/* Source Language Picker */}
<h3 className="label">🗣️ Speak Language</h3>
<select
  value={sourceLang}
  onChange={(e) => setSourceLang(e.target.value)}
  className="voice-select"
>
  {Object.entries(languages).map(([name, code]) => (
    <option key={code} value={code}>
      {name.toUpperCase()}
    </option>
  ))}
</select>


        {/* Language Picker */}
        <select
          value={voiceLang}
          onChange={(e) => setVoiceLang(e.target.value)}
          className="voice-select"
        >
          {Object.entries(languages).map(([name, code]) => (
            <option key={code} value={code}>
              {name.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Record Button */}
        <button className="record-btn" onClick={handleVoiceTranslate} disabled={loading}>
          {loading ? "🎧 Listening & Translating..." : "🎤 Start Recording"}
        </button>

        {/* Result */}
        {result && (
          <div className="output-card">
            <h3>🎤 Detected Speech:</h3>
            <p className="text-line">{result.original}</p>

            {/* ✅ ADD THIS PART */}
    <h3>🗣️ Detected Language:</h3>
    <p className="text-line">
      {result.detectedLang
        ? result.detectedLang.toUpperCase()
        : "Unknown"}
    </p>

            <h3>🌍 Translation:</h3>
            <p className="text-line">{result.translated}</p>

            <h3>🧠 Emotion:</h3>
            <p className="emotion-badge">{result.emotion}</p>

            <h3>🎧 Audio:</h3>
            <audio controls src={result.audio}></audio>

            {/* Copy Button */}
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(result.translated)}
            >
              <Copy size={16} /> Copy Translation
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="history-section">
            <div className="history-header">
              <h2>📜 History</h2>
              <button className="clear-history" onClick={clearHistory}>
                <Trash2 size={16} /> Clear
              </button>
            </div>

            <ul className="history-list">
              {history.map((item, i) => (
                <li key={i} className="history-item">
                  <audio controls src={item.audio}></audio>
                  <p>
  {(item.detectedLang || "unk").toUpperCase()} →{" "}
  {(item.targetLang || "unk").toUpperCase()} • {item.time}
</p>


                  <p className="hist-text">{item.translated}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
