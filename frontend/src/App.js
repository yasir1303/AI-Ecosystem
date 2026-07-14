import React, { useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

// Pages
import Home from "./v0_design/app/page";
import TextTranslator from "./pages/text/TextTranslator";
import VoiceTranslator from "./pages/voice/VoiceTranslator";
import ImageTranslator from "./pages/image/ImageTranslator";
import Chatbot from "./pages/chatbot/chatbot.jsx";
import RealTimeChat from "./pages/chat/RealTimeChat";
import TextSummarizer from "./pages/Summarizer";
import ImageGenerator from "./pages/ai-image-generator";
import ConceptMapper from "./pages/ai-concept-mapper";
import AIDataIntelligenceHub from "./pages/AIDataIntelligenceHub";
import AIMemeGenerator from "./pages/AIMemeGenerator";

// 🌍 Full Supported Languages
export const languages = {
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

export default function App() {
  const imageAudioRef = useRef(null);

  // -------------------- Text Translator --------------------
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [textLang, setTextLang] = useState("hi");
  const [textHistory, setTextHistory] = useState([]);

  // -------------------- Voice Translator --------------------
  const [audioSrc, setAudioSrc] = useState("");
  const [voiceLang, setVoiceLang] = useState("hi");
  const [voiceHistory, setVoiceHistory] = useState([]);

  // -------------------- Image Translator --------------------
  const [imageFile, setImageFile] = useState(null);
  const [imageLang, setImageLang] = useState("hi");
  const [imageHistory, setImageHistory] = useState([]);

  // -------------------- Chatbot --------------------
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMode, setChatMode] = useState("medium");


  // -------------------- API Handlers --------------------
  const handleTextTranslate = async () => {
    const res = await axios.post("http://127.0.0.1:5000/translate/text", { text, target: textLang });
    setTranslatedText(res.data.translated);
    setTextHistory([{ text, translated: res.data.translated }, ...textHistory]);
  };

  const handleTextSpeak = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/translate/text/speak",
        { text, target: textLang },
        { responseType: "blob" }
      );
      const audioURL = URL.createObjectURL(res.data);
      const audio = new Audio(audioURL);
      audio.play();
    } catch (err) {
      console.error("Error playing translated speech:", err);
    }
  };

  const handleVoiceTranslate = async () => {
    try {
      const audioRes = await axios.post(
        "http://localhost:5000/translate/voice",
        { target: voiceLang },
        { responseType: "blob" }
      );

      const audioBlobURL = URL.createObjectURL(audioRes.data);
      setAudioSrc(audioBlobURL);

      setVoiceHistory([
        { input: "Voice input", translated: "Translated output", audio: audioBlobURL, lang: voiceLang },
        ...voiceHistory
      ]);
    } catch (err) {
      console.error("❌ Voice translation failed:", err);
    }
  };

  const handleImageTranslate = async () => {
    if (!imageFile) return;

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("target", imageLang);

      const res = await axios.post("http://127.0.0.1:5000/translate/image", formData);

      setTranslatedText(res.data.translated);
      setImageHistory([{ file: URL.createObjectURL(imageFile), extracted: res.data.extracted, translated: res.data.translated }, ...imageHistory]);

      const audioRes = await axios.post(
        "http://127.0.0.1:5000/translate/image/speak",
        { text: res.data.translated, target: imageLang },
        { responseType: "blob" }
      );

      const audioURL = URL.createObjectURL(audioRes.data);
      const audio = new Audio(audioURL);
      imageAudioRef.current = audio;
      audio.play();
    } catch (err) {
      console.error("Error during image translation or voice playback:", err);
    }
  };

// -------------------- ✅ Updated Chatbot Section (with Memory + Clear Button) --------------------
const handleChat = async () => {
  if (!chatMessage.trim()) return;

  // Add user message instantly to UI
  setChatHistory([{ user: chatMessage, bot: "..." }, ...chatHistory]);
  const userInput = chatMessage;
  setChatMessage("");

  try {
    // 🧠 Send user input to backend (memory-aware)
    const res = await axios.post("http://127.0.0.1:5000/chat_phi3", {
      message: userInput,
      mode: chatMode, // optional, if you use chat modes
    });

    const botReply = res.data.reply || "Sorry, I couldn’t process that message.";

    // 🕐 Typing animation (same logic)
    let displayText = "";
    const words = botReply.split(" ");
    let wordIndex = 0;

    const typingInterval = setInterval(() => {
      displayText += (wordIndex === 0 ? "" : " ") + words[wordIndex];
      setChatHistory((prev) => {
        const updated = [...prev];
        updated[0] = { user: userInput, bot: displayText };
        return updated;
      });

      wordIndex++;
      if (wordIndex >= words.length) {
        clearInterval(typingInterval);
      }
    }, 60);
  } catch (err) {
    console.error("❌ Chatbot Error:", err);
    setChatHistory([{ user: userInput, bot: "Error: Could not reach the chatbot." }, ...chatHistory]);
  }
};

// -------------------- 🧹 Clear Memory Function --------------------
const handleClearMemory = async () => {
  try {
    await axios.post("http://127.0.0.1:5000/clear_memory");
    setChatHistory([{ user: "System", bot: "🧹 Chat memory cleared successfully." }]);
    console.log("✅ Memory cleared successfully.");
  } catch (err) {
    console.error("❌ Error clearing memory:", err);
  }
};



  // -------------------- Pass props to pages --------------------
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/text"
          element={<TextTranslator
            text={text} setText={setText}
            translatedText={translatedText} setTranslatedText={setTranslatedText}
            textLang={textLang} setTextLang={setTextLang}
            textHistory={textHistory} setTextHistory={setTextHistory}
            handleTextTranslate={handleTextTranslate}
            handleTextSpeak={handleTextSpeak}
          />}
        />

        <Route
          path="/voice"
          element={<VoiceTranslator
            audioSrc={audioSrc} setAudioSrc={setAudioSrc}
            voiceLang={voiceLang} setVoiceLang={setVoiceLang}
            voiceHistory={voiceHistory} setVoiceHistory={setVoiceHistory}
            handleVoiceTranslate={handleVoiceTranslate}
            languages={languages}
          />}
        />

        <Route
          path="/image"
          element={<ImageTranslator
            imageFile={imageFile} setImageFile={setImageFile}
            imageLang={imageLang} setImageLang={setImageLang}
            imageHistory={imageHistory} setImageHistory={setImageHistory}
            handleImageTranslate={handleImageTranslate}
            translatedText={translatedText}
            imageAudioRef={imageAudioRef}
          />}
        />

        <Route
          path="/RealTimeChat"
          element={<RealTimeChat
            chatMessage={chatMessage} setChatMessage={setChatMessage}
            chatHistory={chatHistory} setChatHistory={setChatHistory}
            languages={languages}
          />}
        />

        <Route
          path="/Chatbot"
          element={<Chatbot
            chatMessage={chatMessage} setChatMessage={setChatMessage}
            chatHistory={chatHistory} setChatHistory={setChatHistory}
            handleChat={handleChat}
          />}
        />
        {/* 🧠 New AI Text Summarizer Route */}
<Route path="/summarizer" element={<TextSummarizer />} />

{/* 🪨 NEW CARD ROUTE — AI IMAGE GENERATOR */}
<Route path="/imagegen" element={<ImageGenerator />} />
{/* 🐍 NEW CARD ROUTE — AI CONCEPT MAPPER */}
<Route path="/conceptmapper" element={<ConceptMapper />} />

{/* 📊 NEW CARD ROUTE — AI DATA INTELLIGENCE HUB */}
<Route path="/dataintelligence" element={<AIDataIntelligenceHub />} />

<Route path="/meme-generator" element={<AIMemeGenerator />} />


</Routes>
</Router>
);
}
    

