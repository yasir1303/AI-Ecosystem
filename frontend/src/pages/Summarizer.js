'use client'

import { useState, useEffect } from 'react';

const LANGUAGES = [
  { name: "Afrikaans", code: "af" },
  { name: "Albanian", code: "sq" },
  { name: "Amharic", code: "am" },
  { name: "Arabic", code: "ar" },
  { name: "Armenian", code: "hy" },
  { name: "Assamese", code: "as" },
  { name: "Aymara", code: "ay" },
  { name: "Azerbaijani", code: "az" },
  { name: "Bambara", code: "bm" },
  { name: "Basque", code: "eu" },
  { name: "Belarusian", code: "be" },
  { name: "Bengali", code: "bn" },
  { name: "Bhojpuri", code: "bho" },
  { name: "Bosnian", code: "bs" },
  { name: "Bulgarian", code: "bg" },
  { name: "Catalan", code: "ca" },
  { name: "Cebuano", code: "ceb" },
  { name: "Chichewa", code: "ny" },
  { name: "Chinese (Simplified)", code: "zh-CN" },
  { name: "Chinese (Traditional)", code: "zh-TW" },
  { name: "Corsican", code: "co" },
  { name: "Croatian", code: "hr" },
  { name: "Czech", code: "cs" },
  { name: "Danish", code: "da" },
  { name: "Dhivehi", code: "dv" },
  { name: "Dogri", code: "doi" },
  { name: "Dutch", code: "nl" },
  { name: "English", code: "en" },
  { name: "Esperanto", code: "eo" },
  { name: "Estonian", code: "et" },
  { name: "Ewe", code: "ee" },
  { name: "Filipino", code: "tl" },
  { name: "Finnish", code: "fi" },
  { name: "French", code: "fr" },
  { name: "Frisian", code: "fy" },
  { name: "Galician", code: "gl" },
  { name: "Georgian", code: "ka" },
  { name: "German", code: "de" },
  { name: "Greek", code: "el" },
  { name: "Guarani", code: "gn" },
  { name: "Gujarati", code: "gu" },
  { name: "Haitian Creole", code: "ht" },
  { name: "Hausa", code: "ha" },
  { name: "Hawaiian", code: "haw" },
  { name: "Hebrew", code: "iw" },
  { name: "Hindi", code: "hi" },
  { name: "Hmong", code: "hmn" },
  { name: "Hungarian", code: "hu" },
  { name: "Icelandic", code: "is" },
  { name: "Igbo", code: "ig" },
  { name: "Ilocano", code: "ilo" },
  { name: "Indonesian", code: "id" },
  { name: "Irish", code: "ga" },
  { name: "Italian", code: "it" },
  { name: "Japanese", code: "ja" },
  { name: "Javanese", code: "jw" },
  { name: "Kannada", code: "kn" },
  { name: "Kazakh", code: "kk" },
  { name: "Khmer", code: "km" },
  { name: "Kinyarwanda", code: "rw" },
  { name: "Konkani", code: "gom" },
  { name: "Korean", code: "ko" },
  { name: "Krio", code: "kri" },
  { name: "Kurdish (Kurmanji)", code: "ku" },
  { name: "Kurdish (Sorani)", code: "ckb" },
  { name: "Kyrgyz", code: "ky" },
  { name: "Lao", code: "lo" },
  { name: "Latin", code: "la" },
  { name: "Latvian", code: "lv" },
  { name: "Lingala", code: "ln" },
  { name: "Lithuanian", code: "lt" },
  { name: "Luganda", code: "lg" },
  { name: "Luxembourgish", code: "lb" },
  { name: "Macedonian", code: "mk" },
  { name: "Maithili", code: "mai" },
  { name: "Malagasy", code: "mg" },
  { name: "Malay", code: "ms" },
  { name: "Malayalam", code: "ml" },
  { name: "Maltese", code: "mt" },
  { name: "Maori", code: "mi" },
  { name: "Marathi", code: "mr" },
  { name: "Manipuri (Meiteilon)", code: "mni-Mtei" },
  { name: "Mizo", code: "lus" },
  { name: "Mongolian", code: "mn" },
  { name: "Myanmar", code: "my" },
  { name: "Nepali", code: "ne" },
  { name: "Norwegian", code: "no" },
  { name: "Odia", code: "or" },
  { name: "Oromo", code: "om" },
  { name: "Pashto", code: "ps" },
  { name: "Persian", code: "fa" },
  { name: "Polish", code: "pl" },
  { name: "Portuguese", code: "pt" },
  { name: "Punjabi", code: "pa" },
  { name: "Quechua", code: "qu" },
  { name: "Romanian", code: "ro" },
  { name: "Russian", code: "ru" },
  { name: "Samoan", code: "sm" },
  { name: "Sanskrit", code: "sa" },
  { name: "Scots Gaelic", code: "gd" },
  { name: "Sepedi", code: "nso" },
  { name: "Serbian", code: "sr" },
  { name: "Sesotho", code: "st" },
  { name: "Shona", code: "sn" },
  { name: "Sindhi", code: "sd" },
  { name: "Sinhala", code: "si" },
  { name: "Slovak", code: "sk" },
  { name: "Slovenian", code: "sl" },
  { name: "Somali", code: "so" },
  { name: "Spanish", code: "es" },
  { name: "Sundanese", code: "su" },
  { name: "Swahili", code: "sw" },
  { name: "Swedish", code: "sv" },
  { name: "Tajik", code: "tg" },
  { name: "Tamil", code: "ta" },
  { name: "Tatar", code: "tt" },
  { name: "Telugu", code: "te" },
  { name: "Thai", code: "th" },
  { name: "Tigrinya", code: "ti" },
  { name: "Tsonga", code: "ts" },
  { name: "Turkish", code: "tr" },
  { name: "Turkmen", code: "tk" },
  { name: "Twi", code: "ak" },
  { name: "Ukrainian", code: "uk" },
  { name: "Urdu", code: "ur" },
  { name: "Uyghur", code: "ug" },
  { name: "Uzbek", code: "uz" },
  { name: "Vietnamese", code: "vi" },
  { name: "Welsh", code: "cy" },
  { name: "Xhosa", code: "xh" },
  { name: "Yiddish", code: "yi" },
  { name: "Yoruba", code: "yo" },
  { name: "Zulu", code: "zu" },
];

export default function SmartTextSummarizer() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [baseSummary, setBaseSummary] = useState('');
  const [outputLang, setOutputLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const summaryWordCount = summary.trim().split(/\s+/).filter(Boolean).length;

  // -------------------- STORAGE --------------------
  useEffect(() => {
    const savedText = sessionStorage.getItem("summarizer_input");
    const savedSummary = sessionStorage.getItem("summarizer_output");
    const savedHistory = sessionStorage.getItem("summarizer_history");

    if (savedText) setText(savedText);
    if (savedSummary) {
      setSummary(savedSummary);
      setBaseSummary(savedSummary);
    }
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    sessionStorage.setItem("summarizer_input", text);
  }, [text]);

  useEffect(() => {
    sessionStorage.setItem("summarizer_output", summary);
  }, [summary]);

  useEffect(() => {
    sessionStorage.setItem("summarizer_history", JSON.stringify(history));
  }, [history]);

  // -------------------- SUMMARIZE ONCE --------------------
  const handleSummarize = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setSummary('');
    setBaseSummary('');

    const res = await fetch("http://127.0.0.1:5000/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();

    setBaseSummary(data.summary);
    setSummary(data.summary);
    setOutputLang("en");

    setHistory([
      {
        id: Date.now(),
        input: text,
        summary: data.summary,
        timestamp: new Date().toLocaleTimeString(),
        inputWords: wordCount,
        outputWords: data.summary.split(/\s+/).length,
      },
      ...history
    ]);

    setLoading(false);
  };

  // -------------------- TRANSLATE SUMMARY ONLY --------------------
  const handleTranslateSummary = async () => {
    if (!baseSummary || outputLang === "en") {
      setSummary(baseSummary);
      return;
    }

    const res = await fetch("http://127.0.0.1:5000/translate/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: baseSummary,
        target: outputLang,
      }),
    });

    const data = await res.json();
    setSummary(data.translated);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // -------------------- UI (UNCHANGED) --------------------
  return (
    <div className="min-h-screen w-full overflow-hidden">
      <style>{`
        body { background: linear-gradient(135deg,#dffeff,#d4f5ff,#cafff8); }
      `}</style>

      <div className="flex items-center justify-start min-h-screen p-4 pt-12">
        <div className="w-full max-w-3xl mx-auto">

          <button
            onClick={() => window.history.back()}
            className="mb-6 p-3 rounded-full bg-gradient-to-r from-amber-200/60 to-yellow-200/60 hover:scale-110 transition-all shadow-lg"
          >
            ← Back
          </button>

          <div className="backdrop-blur-xl bg-white/90 rounded-3xl border border-white/40 shadow-2xl p-8 animate-fade-in">

            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00b5b5] via-[#009090] to-[#007777] bg-clip-text text-transparent">
                📝 Smart Text Summarizer
              </h1>
              <p className="text-lg text-[#00a8a8]">
                Paste or type any paragraph — AI will generate a clear summary.
              </p>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text here..."
              className="w-full h-56 p-4 rounded-3xl border-2 border-[#00e0d8] bg-white/80 resize-none"
            />

            <div className="mt-4 flex gap-3">
              <div className="px-4 py-2 rounded-full border border-[#00e0d8]">
                📊 Input Words: {wordCount}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold mb-2">🌍 Output Language</label>
              <select
                value={outputLang}
                onChange={(e) => setOutputLang(e.target.value)}
                className="w-full px-4 py-3 rounded-full border-2 border-[#00e0d8]"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSummarize}
              disabled={loading}
              className="w-full mt-6 py-4 rounded-full text-white font-bold bg-gradient-to-r from-[#00e0d8] to-[#00b5b5]"
            >
              {loading ? "⚙️ Summarizing..." : "🧠 Generate Summary"}
            </button>

            {baseSummary && (
              <button
                onClick={handleTranslateSummary}
                className="w-full mt-3 py-3 rounded-full bg-[#007777] text-white font-semibold"
              >
                🌍 Translate Summary
              </button>
            )}

            {summary && (
              <div className="mt-6 p-6 rounded-3xl border-2 border-[#00e0d8] bg-white/70">
                <h3 className="font-bold mb-3">📄 Summary</h3>
                <p>{summary}</p>
                <div className="flex justify-between mt-4">
                  <span>📊 Output Words: {summaryWordCount}</span>
                  <button onClick={copyToClipboard}>
                    {copied ? "✓ Copied!" : "📋 Copy"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
