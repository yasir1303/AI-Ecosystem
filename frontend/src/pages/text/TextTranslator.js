import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Trash2, Volume2 } from "lucide-react";
import Select from "react-select";

// ADD THIS
import { franc } from "franc";
import langs from "langs";

// Your languages array remains same
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

const languageOptions = LANGUAGES.map((l) => ({
  value: l.code,
  label: l.name,
}));

export default function TextTranslatorNew() {
  const navigate = useNavigate();

  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [langSearch, setLangSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // ADD THIS STATE
  const [detectedLang, setDetectedLang] = useState({ code: "", name: "" });
  // ADD — LOAD SAVED DATA ON PAGE LOAD
  React.useEffect(() => {
    const savedText = localStorage.getItem("text_input");
    const savedTranslated = localStorage.getItem("text_translated");
    const savedLang = localStorage.getItem("text_selected_language");
    const savedHistory = localStorage.getItem("text_history");

    if (savedText) setInputText(savedText);
    if (savedTranslated) setTranslatedText(savedTranslated);
    if (savedLang) setSelectedLanguage(savedLang);
    if (savedHistory) {
    const parsed = JSON.parse(savedHistory).map((h) => ({
      ...h,
      timestamp: new Date(h.timestamp),
    }));
    setHistory(parsed);
  }
}, []);
  
  // ADD THIS FUNCTION
  const detectLanguage = (text) => {
    if (!text.trim()) return { code: "", name: "" };

    const langCode3 = franc(text);
    if (langCode3 === "und") return { code: "", name: "Could not detect" };

    try {
      const lang = langs.where("3", langCode3);
      return { code: lang["1"], name: lang.name };
    } catch {
      return { code: "", name: "" };
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);

    // REAL backend call
    try {
      const res = await fetch("http://127.0.0.1:5000/translate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, target: selectedLanguage }),
      });

      const data = await res.json();
      const translated = data.translated;

      setTranslatedText(translated);

      setHistory([
        {
          id: Date.now(),
          text: inputText,
          translation: translated,
          language: selectedLanguage,
          timestamp: new Date(),
        },
        ...history,
      ]);
    } catch {
      setTranslatedText("Translation failed.");
    }

    setIsLoading(false);
  };

  const handleSpeak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = selectedLanguage;
    speechSynthesis.speak(utter);
  };

  const handleCopy = (text) => navigator.clipboard.writeText(text);

  const clearHistory = () => setHistory([]);

  const timeAgo = (date) => {
    const diff = (new Date() - date) / 60000;
    if (diff < 1) return "just now";
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };
  const filteredLanguages = LANGUAGES.filter(lang =>
  lang.name.toLowerCase().includes(langSearch.toLowerCase())
);


  return (
    <main className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#E8FFFE] via-[#E0FFFD] to-[#D0FFFE]">
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Back Button */}
        <div className="pt-6 px-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <span className="text-xl">←</span>
            Back
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-[750px]">

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-[#00C8C8] to-[#009E9E] bg-clip-text text-transparent">
                ✨ Text Translator
              </h1>
              <p className="text-gray-500 text-lg">Translate and listen instantly.</p>
            </div>

            {/* Card */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-2xl space-y-6">

              {/* Language Select */}
              <div className="flex gap-3 items-center">
                <label className="font-semibold text-gray-700">Language:</label>
                <Select
  options={languageOptions}
  value={languageOptions.find(
    (opt) => opt.value === selectedLanguage
  )}
  onChange={(selected) =>
    setSelectedLanguage(selected.value)
  }
  placeholder="Search language (e.g. Hindi, Kannada...)"
  isSearchable
  className="flex-1"
  styles={{
    control: (base) => ({
      ...base,
      borderRadius: "0.75rem",
      borderColor: "#00C8C8",
      padding: "2px",
    }),
  }}
/>

              </div>

              {/* Textarea */}
              <textarea
                className="w-full h-32 px-4 py-3 bg-white border border-[#00C8C8]/20 rounded-xl"
                placeholder="Enter text..."
                value={inputText}
                onChange={(e) => {
                  const txt = e.target.value;
                  setInputText(txt);

                  // AUTO-DETECT LANGUAGE
                  const detected = detectLanguage(txt);
                  setDetectedLang(detected);
                }}
              />

              {/* SHOW DETECTED LANGUAGE */}
              {detectedLang.name && (
                <p className="text-sm text-gray-600">
                  <strong>Detected Language:</strong> {detectedLang.name}
                </p>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleTranslate}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-[#00C8C8] to-[#009E9E] text-white py-3 rounded-xl"
                >
                  {isLoading ? "Translating..." : "Translate"}
                </button>

                <button
                  onClick={() => handleSpeak(translatedText)}
                  className="bg-gradient-to-r from-[#00C8C8] to-[#009E9E] text-white px-5 py-3 rounded-xl"
                >
                  <Volume2 size={22} />
                </button>
              </div>

              {/* Output */}
              {translatedText && (
                <div className="bg-[#00C8C8]/10 border border-[#00C8C8]/30 rounded-xl p-4">
                  <p>{translatedText}</p>

                  <div className="flex gap-4 pt-3">
                    <button
                      className="flex items-center gap-2"
                      onClick={() => handleCopy(translatedText)}
                    >
                      <Copy size={18} /> Copy
                    </button>

                    <button
                      className="flex items-center gap-2"
                      onClick={() => handleSpeak(translatedText)}
                    >
                      <Volume2 size={18} /> Listen
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="mt-10">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold text-gray-700">History</h2>
                  <button
                    onClick={clearHistory}
                    className="text-red-500 flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Clear
                  </button>
                </div>

                <div className="space-y-3">
                  {history.map((h) => (
                    <div key={h.id} className="bg-white/70 shadow p-4 rounded-xl">
                      <div className="flex justify-between">
                        <span className="text-xs text-[#00C8C8]">
                          {h.language}
                        </span>
                        <span className="text-xs text-gray-500">
                          {timeAgo(h.timestamp)}
                        </span>
                      </div>

                      <p className="text-gray-700 mt-1">{h.text}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {h.translation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
