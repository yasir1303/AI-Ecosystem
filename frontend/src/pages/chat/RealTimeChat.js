import React, { useEffect, useRef, useState } from "react";
import { Mic, Send, Volume2 } from "lucide-react";

/* --------- Language map (paste your 130+ languages) --------- */
const LANG_NAME_TO_CODE = {
  afrikaans: "af", albanian: "sq", amharic: "am", arabic: "ar", armenian: "hy",
  assamese: "as", aymara: "ay", azerbaijani: "az", bambara: "bm", basque: "eu",
  belarusian: "be", bengali: "bn", bhojpuri: "bho", bosnian: "bs", bulgarian: "bg",
  catalan: "ca", cebuano: "ceb", chichewa: "ny", "chinese (simplified)": "zh-CN",
  "chinese (traditional)": "zh-TW", corsican: "co", croatian: "hr", czech: "cs",
  danish: "da", dhivehi: "dv", dogri: "doi", dutch: "nl", english: "en", esperanto: "eo",
  estonian: "et", ewe: "ee", filipino: "tl", finnish: "fi", french: "fr", frisian: "fy",
  galician: "gl", georgian: "ka", german: "de", greek: "el", guarani: "gn", gujarati: "gu",
  "haitian creole": "ht", hausa: "ha", hawaiian: "haw", hebrew: "iw", hindi: "hi", hmong: "hmn",
  hungarian: "hu", icelandic: "is", igbo: "ig", ilocano: "ilo", indonesian: "id", irish: "ga",
  italian: "it", japanese: "ja", javanese: "jw", kannada: "kn", kazakh: "kk", khmer: "km",
  kinyarwanda: "rw", konkani: "gom", korean: "ko", krio: "kri", "kurdish (kurmanji)": "ku",
  "kurdish (sorani)": "ckb", kyrgyz: "ky", lao: "lo", latin: "la", latvian: "lv",
  lingala: "ln", lithuanian: "lt", luganda: "lg", luxembourgish: "lb", macedonian: "mk",
  maithili: "mai", malagasy: "mg", malay: "ms", malayalam: "ml", maltese: "mt", maori: "mi",
  marathi: "mr", "meiteilon (manipuri)": "mni-Mtei", mizo: "lus", mongolian: "mn", myanmar: "my",
  nepali: "ne", norwegian: "no", "odia (oriya)": "or", oromo: "om", pashto: "ps", persian: "fa",
  polish: "pl", portuguese: "pt", punjabi: "pa", quechua: "qu", romanian: "ro", russian: "ru",
  samoan: "sm", sanskrit: "sa", "scots gaelic": "gd", sepedi: "nso", serbian: "sr", sesotho: "st",
  shona: "sn", sindhi: "sd", sinhala: "si", slovak: "sk", slovenian: "sl", somali: "so",
  spanish: "es", sundanese: "su", swahili: "sw", swedish: "sv", tajik: "tg", tamil: "ta",
  tatar: "tt", telugu: "te", thai: "th", tigrinya: "ti", tsonga: "ts", turkish: "tr",
  turkmen: "tk", twi: "ak", ukrainian: "uk", urdu: "ur", uyghur: "ug", uzbek: "uz",
  vietnamese: "vi", welsh: "cy", xhosa: "xh", yiddish: "yi", yoruba: "yo", zulu: "zu"
};

const LANG_OPTIONS = Object.entries(LANG_NAME_TO_CODE)
  .map(([name, code]) => ({ name, code }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function RealtimeChat() {
  const [messages, setMessages] = useState([
    // optional seed messages
    // { speaker: "A", original: "Hello!", translated: "Hola!", audio: null }
  ]);

  const [langA, setLangA] = useState("en");
  const [langB, setLangB] = useState("hi");

  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");

  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [micLoadingA, setMicLoadingA] = useState(false);
  const [micLoadingB, setMicLoadingB] = useState(false);

  const API_BASE = "http://127.0.0.1:5000";

  const chatBoxRef = useRef(null);
  useEffect(() => {
  const saved = localStorage.getItem("realtimeChatMessages");
  if (saved) {
    setMessages(JSON.parse(saved));
  }

  const savedA = localStorage.getItem("langA");
  const savedB = localStorage.getItem("langB");

  if (savedA) setLangA(savedA);
  if (savedB) setLangB(savedB);
}, []);
useEffect(() => {
  localStorage.setItem("realtimeChatMessages", JSON.stringify(messages));
}, [messages]);


  // Auto-scroll when messages update
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight + 200;
    }
  }, [messages]);

  /* ---------- send text A -> B ---------- */
  const sendFromA = async () => {
    if (!textA.trim()) return;
    const pending = { speaker: "A", original: textA, translated: "Translating..." };
    setMessages((prev) => [...prev, pending]);
    setLoadingA(true);

    try {
      const res = await fetch(`${API_BASE}/realtime_chat/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textA, from_lang: langA, to_lang: langB }),
      });
      const data = await res.json();

      const final = {
        speaker: "A",
        original: textA,
        translated: data.translated || data.translated_text || "No translation",
        audio: data.audio_url ? (data.audio_url.startsWith("http") ? data.audio_url : API_BASE + data.audio_url) : null,
      };

      setMessages((prev) => [...prev.slice(0, -1), final]);
      if (final.audio) {
        const audio = new Audio(final.audio);
        try { await audio.play(); } catch (e) { /* autoplay blocked */ }
      }
      setTextA("");
    } catch (err) {
      console.error("Send A error:", err);
      setMessages((prev) => [...prev.slice(0, -1), { speaker: "A", original: textA, translated: "⚠ Error" }]);
    } finally {
      setLoadingA(false);
    }
  };

  /* ---------- send text B -> A ---------- */
  const sendFromB = async () => {
    if (!textB.trim()) return;
    const pending = { speaker: "B", original: textB, translated: "Translating..." };
    setMessages((prev) => [...prev, pending]);
    setLoadingB(true);

    try {
      const res = await fetch(`${API_BASE}/realtime_chat/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textB, from_lang: langB, to_lang: langA }),
      });
      const data = await res.json();

      const final = {
        speaker: "B",
        original: textB,
        translated: data.translated || data.translated_text || "No translation",
        audio: data.audio_url ? (data.audio_url.startsWith("http") ? data.audio_url : API_BASE + data.audio_url) : null,
      };

      setMessages((prev) => [...prev.slice(0, -1), final]);
      if (final.audio) {
        const audio = new Audio(final.audio);
        try { await audio.play(); } catch (e) {}
      }
      setTextB("");
    } catch (err) {
      console.error("Send B error:", err);
      setMessages((prev) => [...prev.slice(0, -1), { speaker: "B", original: textB, translated: "⚠ Error" }]);
    } finally {
      setLoadingB(false);
    }
  };

  /* ---------- Mic triggers backend recording (Option A) ---------- */
  const triggerMicA = async () => {
    setMicLoadingA(true);
    const pending = { speaker: "A", original: "Recording...", translated: "Processing..." };
    setMessages((prev) => [...prev, pending]);

    try {
      const res = await fetch(`${API_BASE}/realtime_chat/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
    source: langA,   // ✅ FIX
    to_lang: langB
  }),
      });
      const data = await res.json();

      const final = {
        speaker: "A",
        original: data.original || data.text || "—",
        translated: data.translated || data.translated_text || "—",
        emotion: data.emotion || null,
        audio: data.audio_url ? (data.audio_url.startsWith("http") ? data.audio_url : API_BASE + data.audio_url) : null,
      };

      setMessages((prev) => [...prev.slice(0, -1), final]);
      if (final.audio) {
        const audio = new Audio(final.audio);
        try { await audio.play(); } catch (e) {}
      }
    } catch (err) {
      console.error("Mic A error:", err);
      setMessages((prev) => [...prev.slice(0, -1), { speaker: "A", original: "Error", translated: "⚠ Error" }]);
    } finally {
      setMicLoadingA(false);
    }
  };

  const triggerMicB = async () => {
    setMicLoadingB(true);
    const pending = { speaker: "B", original: "Recording...", translated: "Processing..." };
    setMessages((prev) => [...prev, pending]);

    try {
      const res = await fetch(`${API_BASE}/realtime_chat/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
    source: langB,   // ✅ FIX
    to_lang: langA
  }),
      });
      const data = await res.json();

      const final = {
        speaker: "B",
        original: data.original || data.text || "—",
        translated: data.translated || data.translated_text || "—",
        emotion: data.emotion || null,
        audio: data.audio_url ? (data.audio_url.startsWith("http") ? data.audio_url : API_BASE + data.audio_url) : null,
      };

      setMessages((prev) => [...prev.slice(0, -1), final]);
      if (final.audio) {
        const audio = new Audio(final.audio);
        try { await audio.play(); } catch (e) {}
      }
    } catch (err) {
      console.error("Mic B error:", err);
      setMessages((prev) => [...prev.slice(0, -1), { speaker: "B", original: "Error", translated: "⚠ Error" }]);
    } finally {
      setMicLoadingB(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#dffeff] via-[#d4f5ff] to-[#cafff8]">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#00b5b5] to-[#009090]">
            🌍 AI Live Translator 2.0
          </h1>
          <p className="text-sm md:text-base text-[#00a8a8] font-medium">
            Type or Speak — backend records & translates in real-time.
          </p>
          <button
  onClick={() => window.history.back()}
  className="absolute top-4 left-4 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-xl shadow text-[#009090] font-semibold hover:bg-white transition-all"
>
  ← Back
</button>
<button
  onClick={() => {
    setMessages([]);
    localStorage.removeItem("realtimeChatMessages");
  }}
  className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-xl shadow"
>
  Clear Chat
</button>

        </div>
          
        {/* Card */}
        <div className="rounded-3xl bg-white/90 border border-white/40 shadow-2xl overflow-hidden">
          {/* Conversation area */}
          <div
            ref={chatBoxRef}
            className="h-96 overflow-y-auto p-8 bg-gradient-to-b from-white/50 to-white/30"
            aria-live="polite"
          >
            <div className="space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.speaker === "A" ? "justify-start" : "justify-end"} animate-fade`}
                >
                  <div
                    className={`max-w-md rounded-2xl p-5 backdrop-blur-xl border-2 shadow-lg transform transition-all duration-300 hover:scale-[1.03] ${
                      msg.speaker === "A" ? "bg-white/80 border-[#00e0d8] text-left" : "bg-white/80 border-[#009090] text-right"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {msg.speaker === "A" && <div className="text-2xl flex-shrink-0">🧑‍🦱</div>}
                      <div className="flex-1">
                        <div className="font-bold text-[#00a8a8] mb-2">Speaker {msg.speaker}</div>
                        <div className="text-gray-800 font-semibold mb-3">{msg.original}</div>
                        <div className="text-sm text-[#00b5b5] flex items-center gap-2 mb-3">
                          <span>✨</span>
                          <span>{msg.translated}</span>
                        </div>

                        <div className="bg-white/60 rounded-lg p-2 flex items-center justify-between cursor-pointer hover:bg-[#e8fffe] transition-colors">
                          <div className="text-xs text-gray-600">Audio player</div>
                          <Volume2 className="w-4 h-4 text-[#00b5b5]" />
                        </div>
                      </div>
                      {msg.speaker === "B" && <div className="text-2xl flex-shrink-0">🧑‍🦱</div>}
                    </div>

                    {msg.audio && (
                      <audio controls className="w-full mt-3" src={msg.audio} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#00e0d8] to-transparent" />

          {/* Input area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-white/40">
            {/* Speaker A */}
            <div className="space-y-4 md:pr-6 md:border-r md:border-[#00e0d8]/30">
              <div>
                <label className="block text-sm font-semibold text-[#00a8a8] mb-2">Speaker A Language</label>
                <select
                  value={langA}
                  onChange={(e) => setLangA(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#00e0d8] bg-white/80 text-gray-800 font-medium focus:outline-none focus:border-[#009090] focus:ring-2 focus:ring-[#00e0d8]/30 transition-all"
                >
                  {LANG_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.name.charAt(0).toUpperCase() + opt.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <textarea
                  value={textA}
                  onChange={(e) => setTextA(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#00e0d8] bg-white/80 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#009090] focus:ring-2 focus:ring-[#00e0d8]/30 transition-all resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={sendFromA}
                  className="flex-1 bg-gradient-to-r from-[#00e0d8] to-[#00b5b5] hover:from-[#00d4cc] hover:to-[#009e9e] text-white font-semibold py-3 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                  disabled={loadingA}
                >
                  <Send className="w-4 h-4" />
                  {loadingA ? "Sending..." : "Send"}
                </button>

                <button
                  onClick={triggerMicA}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    micLoadingA ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : "bg-gradient-to-r from-[#00e0d8] to-[#00b5b5] hover:from-[#00d4cc] hover:to-[#009e9e] text-white"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span className="ml-2">{micLoadingA ? "Listening..." : "Mic"}</span>
                </button>
              </div>
            </div>

            {/* Speaker B */}
            <div className="space-y-4 md:pl-6">
              <div>
                <label className="block text-sm font-semibold text-[#00a8a8] mb-2">Speaker B Language</label>
                <select
                  value={langB}
                  onChange={(e) => setLangB(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#00e0d8] bg-white/80 text-gray-800 font-medium focus:outline-none focus:border-[#009090] focus:ring-2 focus:ring-[#00e0d8]/30 transition-all"
                >
                  {LANG_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.name.charAt(0).toUpperCase() + opt.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <textarea
                  value={textB}
                  onChange={(e) => setTextB(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#00e0d8] bg-white/80 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#009090] focus:ring-2 focus:ring-[#00e0d8]/30 transition-all resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={sendFromB}
                  className="flex-1 bg-gradient-to-r from-[#00e0d8] to-[#00b5b5] hover:from-[#00d4cc] hover:to-[#009e9e] text-white font-semibold py-3 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                  disabled={loadingB}
                >
                  <Send className="w-4 h-4" />
                  {loadingB ? "Sending..." : "Send"}
                </button>

                <button
                  onClick={triggerMicB}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    micLoadingB ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : "bg-gradient-to-r from-[#00e0d8] to-[#00b5b5] hover:from-[#00d4cc] hover:to-[#009e9e] text-white"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span className="ml-2">{micLoadingB ? "Listening..." : "Mic"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal keyframes for the same subtle entrance/pulse */}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade { animation: fadeInUp 0.35s ease both; }
        .animate-pulse { animation: pulse 1s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
}
