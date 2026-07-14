import React, { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Volume2, Copy, Square } from "lucide-react";
import { LanguageSelector } from "./language-selector";
import { ImageUploadZone } from "./image-upload-zone";
import { HistoryItem } from "./history-item";
import { languages } from "../../App";
import { franc } from "franc";
const TTS_LANG_MAP = {
  en: "en-US",
  hi: "hi-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  te: "te-IN",
  es: "es-ES",
  ru: "ru-RU"
};


export default function ImageTranslator() {
  const [targetLanguage, setTargetLanguage] = useState(
  localStorage.getItem("img_target_lang") || "hi"
);

const [uploadedImage, setUploadedImage] = useState(
  localStorage.getItem("img_uploaded_image") || null
);

const [extractedText, setExtractedText] = useState(
  localStorage.getItem("img_extracted_text") || ""
);

const [translatedText, setTranslatedText] = useState(
  localStorage.getItem("img_translated_text") || ""
);
const [isTranslating, setIsTranslating] = useState(false);

const [detectedLang, setDetectedLang] = useState(
  localStorage.getItem("img_detected_lang") || null
);

const [history, setHistory] = useState(() => {
  const saved = localStorage.getItem("img_history");
  return saved ? JSON.parse(saved) : [];
});
// Auto-save everything
useEffect(() => {
  localStorage.setItem("img_target_lang", targetLanguage);
}, [targetLanguage]);

useEffect(() => {
  if (uploadedImage)
    localStorage.setItem("img_uploaded_image", uploadedImage);
}, [uploadedImage]);

useEffect(() => {
  localStorage.setItem("img_extracted_text", extractedText);
}, [extractedText]);

useEffect(() => {
  localStorage.setItem("img_translated_text", translatedText);
}, [translatedText]);

useEffect(() => {
  localStorage.setItem("img_detected_lang", detectedLang);
}, [detectedLang]);

useEffect(() => {
  localStorage.setItem("img_history", JSON.stringify(history));
}, [history]);
useEffect(() => {
  window.speechSynthesis.onvoiceschanged = () => {};
}, []);


  // SPEECH UTTERANCE
  let speaking = false;

  const handleSpeak = (text) => {
  if (!text) return;

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);

  utter.lang = TTS_LANG_MAP[targetLanguage] || "en-US";
  utter.rate = 1;
  utter.pitch = 1;

  // OPTIONAL: pick matching voice SAFELY
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) => v.lang === utter.lang
  );
  if (matchedVoice) {
    utter.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utter);
};


  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    speaking = false;
  };

  // MAP detected ISO → full name
  const detectLanguage = (text) => {
    const code = franc(text);

    if (code === "und") {
      setDetectedLang("Unknown");
      return;
    }

    // Find the matching language name from your languages object
    const langName =
      Object.keys(languages).find((key) => languages[key] === code) ||
      "Unknown";

    setDetectedLang(`${langName} (${code})`);
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgURL = e.target.result;
      setUploadedImage(imgURL);
      localStorage.setItem("img_uploaded_image", imgURL);
    };
    reader.readAsDataURL(file);
  };

  // TRANSLATE API CALL
  const handleTranslate = async () => {
    if (!uploadedImage) return;

    setIsTranslating(true);

    const formData = new FormData();
    formData.append("file", dataURLtoBlob(uploadedImage));
    formData.append("target", targetLanguage);

    try {
      const res = await fetch("http://127.0.0.1:5000/translate/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setExtractedText(data.extracted);
localStorage.setItem("img_extracted_text", data.extracted);

setTranslatedText(data.translated);
localStorage.setItem("img_translated_text", data.translated);


      // AUTO-DETECT extracted text language
      detectLanguage(data.extracted);

      // Save to history
      const newItem = {
        id: Date.now(),
        imageUrl: uploadedImage,
        extractedText: data.extracted,
        translatedText: data.translated,
        language: targetLanguage,
        timestamp: new Date(),
      };

      setHistory([newItem, ...history]);
    } catch (error) {
      console.log("Translation error:", error);
    }

    setIsTranslating(false);
  };

  // Convert base64 image to Blob
  const dataURLtoBlob = (dataURL) => {
    let arr = dataURL.split(",");
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);

    while (n--) u8arr[n] = bstr.charCodeAt(n);

    return new Blob([u8arr], { type: mime });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100/60 via-cyan-50/40 to-cyan-100/30 relative overflow-hidden">

      {/* GRID BG */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,200,200,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,200,200,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 min-h-screen flex flex-col items-center">

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mt-8 ml-4 flex items-center gap-2 text-gray-600 hover:text-cyan-600"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        {/* Title */}
        <div className="mt-4 text-center animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-700 bg-clip-text text-transparent">
            ✨ Image Translator
          </h1>
          <p className="text-gray-500 text-lg mt-2">
            Extract & translate text from images.
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-[750px] mt-8 bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl">

          {/* Language Select */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Target Language:
            </label>
            <LanguageSelector value={targetLanguage} onChange={setTargetLanguage} />
          </div>

          {/* Upload */}
          {!uploadedImage ? (
            <ImageUploadZone onUpload={handleImageUpload} />
          ) : (
            <>
              <img
                src={uploadedImage}
                className="w-full h-48 object-cover rounded-xl shadow-md mb-4"
              />

              <button
                onClick={() => {
                  setUploadedImage(null);
                  setExtractedText("");
                  setTranslatedText("");
                }}
                className="bg-red-500 text-white px-3 py-2 rounded-xl mb-4"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Detect Language Display */}
              {detectedLang && (
                <div className="bg-cyan-50 border border-cyan-200 p-3 rounded-xl mb-3 text-cyan-700 font-medium">
                  Detected Language: {detectedLang}
                </div>
              )}

              {/* Extracted Text */}
              {extractedText && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Extracted Text</h3>
                  <div className="bg-white/50 border border-cyan-100 p-4 rounded-xl">
                    {extractedText}
                  </div>
                </div>
              )}

              {/* Translate Button */}
              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-3 rounded-xl text-lg shadow-md"
              >
                {isTranslating ? "Translating..." : "Translate Image"}
              </button>

              {/* Translation Output */}
              {translatedText && (
                <div className="mt-6 p-4 bg-white/60 border border-cyan-200 rounded-xl">
                  <h3 className="font-semibold text-gray-700 mb-2">Translation</h3>
                  <p className="text-gray-800">{translatedText}</p>

                  <div className="flex gap-3 mt-3">
                    <button
                      className="px-4 py-2 bg-cyan-500 text-white rounded-lg flex items-center gap-2"
                      onClick={() => navigator.clipboard.writeText(translatedText)}
                    >
                      <Copy size={18} /> Copy
                    </button>

                    <button
                      className="px-4 py-2 bg-cyan-500 text-white rounded-lg flex items-center gap-2"
                      onClick={() => handleSpeak(translatedText)}
                    >
                      <Volume2 size={18} /> Speak
                    </button>

                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2"
                      onClick={stopSpeaking}
                    >
                      <Square size={18} /> Stop
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="w-full max-w-[750px] mt-10">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-700">History</h2>
              <button
                onClick={() => setHistory([])}
                className="text-red-500 flex items-center gap-2"
              >
                <Trash2 size={16} /> Clear
              </button>
            </div>

            <div className="space-y-3">
              {history.map((item) => (
                <HistoryItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
