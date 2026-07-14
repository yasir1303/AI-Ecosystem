// src/pages/Chatbot.js
import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Bot } from "lucide-react";
import ChatMessage from "./chat-message.jsx";
import ChatInput from "./chat-input.jsx";
import ChatToolbar from "./chat-toolbar.jsx";

import "./chatbot.css";
import { useNavigate } from "react-router-dom";

export default function Chatbot() {
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("chatbotHistory");
    return saved
      ? JSON.parse(saved).map((m) => ({ ...m, timestamp: new Date(m.timestamp) }))
      : [
          {
            id: "1",
            type: "bot",
            content:
              "Hello! I'm your AI assistant. How can I help you explore the AI Ecosystem today?",
            timestamp: new Date(),
          },
        ];
  });

  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [responseStyle, setResponseStyle] = useState("short");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  const goBackHome = () => navigate("/");

  // auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // typing simulation helper (keeps existing typing UX)
  const simulateTyping = (botReply) => {
  setIsTyping(true);
  let i = 0;
  let displayText = "";

  const interval = setInterval(() => {
    displayText = botReply.slice(0, i + 1);

    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        content: displayText,
      };
      return updated;
    });

    i++;
    if (i >= botReply.length) {
      clearInterval(interval);
      setIsTyping(false);
    }
  }, 15);
};


  // send (uses your backend endpoints)
  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const messageToSend = String(inputValue || "").trim();
    if (!messageToSend || isLoading) return;

    setIsLoading(true);
    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: messageToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => {
      const updated = [...prev, userMessage];
      sessionStorage.setItem("chatbotHistory", JSON.stringify(updated));
      return updated;
    });
    setInputValue("");

    const tempBot = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => {
      const updated = [...prev, tempBot];
      sessionStorage.setItem("chatbotHistory", JSON.stringify(updated));
      return updated;
    });

    try {
      const res = await fetch("http://127.0.0.1:5000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend, mode: responseStyle }),
      });

      const data = await res.json();
      const botReply = data.reply || "Sorry, I couldn’t process that message.";
      if (botReply.length <= 200) {
  // short answers → typing animation
  simulateTyping(botReply);
} else {
  // long answers → render instantly (NO typing)
  setIsTyping(false);
  setMessages((prev) => {
    const updated = [...prev];
    updated[updated.length - 1] = {
      ...updated[updated.length - 1],
      content: botReply,
    };
    sessionStorage.setItem("chatbotHistory", JSON.stringify(updated));
    return updated;
  });
}

    } catch (error) {
      console.error("❌ Chatbot Error:", error);
      setMessages((prev) => {
        const updated = [...prev.slice(0, -1), { ...prev[prev.length - 1], content: "⚠️ Error connecting to chatbot." }];
        sessionStorage.setItem("chatbotHistory", JSON.stringify(updated));
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // voice input using your backend endpoint (voice_input_v2)
  const handleMicToggle = async () => {
    if (!isRecording) {
      setIsRecording(true);
      try {
        const res = await fetch("http://127.0.0.1:5000/voice_input_v2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Voice input failed");
        const data = await res.json();

        if (data.error) {
          alert("⚠️ " + data.error);
          setIsRecording(false);
          return;
        }

        const recognized = data.recognized_text || "No voice recognized";
        const botReply = data.bot_reply || "Sorry, I couldn’t process that.";

        const userMessage = { id: Date.now().toString(), type: "user", content: recognized, timestamp: new Date() };
        const tempBot = { id: (Date.now()+1).toString(), type: "bot", content: botReply, timestamp: new Date() };

        setMessages((prev) => {
          const updated = [...prev, userMessage, tempBot];
          sessionStorage.setItem("chatbotHistory", JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error("🎤 Voice input failed:", err);
        alert("⚠️ Voice input failed. Check Flask connection.");
      } finally {
        setIsRecording(false);
      }
    } else {
      // stop flow (if your backend supports stopping, call it here)
      setIsRecording(false);
    }
  };

  // TTS read and stop
  const handleReadAloud = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  };
  const handleStopAudio = () => window.speechSynthesis.cancel();

  // clear chat
  const handleClearChat = () => {
    if (window.confirm("Clear entire chat history?")) {
      setMessages([
        {
          id: "1",
          type: "bot",
          content: "Chat cleared. How can I assist you?",
          timestamp: new Date(),
        },
      ]);
      sessionStorage.removeItem("chatbotHistory");
    }
  };

  // export txt/pdf
  const exportToTxt = () => {
    if (messages.length === 0) return alert("No chat history to export!");
    const textData = messages.map((m) => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.type === "user" ? "You" : "Bot"}: ${m.content}`).join("\n\n");
    const blob = new Blob([textData], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Chatbot_Conversation.txt";
    link.click();
  };

  const exportToPdf = () => {
    if (messages.length === 0) return alert("No chat history to export!");
    // lightweight PDF export using jsPDF would be better; for now produce a text-based file with .pdf extension
    const content = messages.map((m) => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.type.toUpperCase()}: ${m.content}`).join("\n\n");
    const blob = new Blob([content], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Chatbot_Conversation.pdf";
    link.click();
  };

  // expose read/stop actions to ChatMessage via props (we'll pass handler props where needed)
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f0f9ff] tech-pattern flex flex-col">
      <header className="border-b border-white/20 backdrop-blur-sm bg-white/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <button onClick={goBackHome} className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Back Home</span>
            </button>
            <h1 className="text-2xl sm:text-4xl font-bold text-balance teal-gradient-text drop-shadow-sm">Smart Chatbot</h1>
            <div className="w-12" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
        <div
  className="
    w-full 
    max-w-3xl 
    flex flex-col 
    rounded-3xl 
    overflow-hidden
    bg-gradient-to-b 
    from-[rgba(240,255,255,0.95)]
    to-[rgba(185,245,235,0.95)]
    backdrop-blur-xl 
    shadow-[0_8px_30px_rgba(0,0,0,0.08)]
    border 
    border-white/40
  "
>


          <ChatToolbar
            responseStyle={responseStyle}
            onResponseStyleChange={setResponseStyle}
            onExportTxt={exportToTxt}
            onExportPdf={exportToPdf}
            onClearChat={handleClearChat}
          />

         <div
  ref={chatContainerRef}
  className="
    flex-1 
    overflow-y-auto 
    p-4 sm:p-6 
    space-y-4
    bg-gradient-to-b 
    from-transparent
    to-[rgba(185,245,235,0.55)]
  "
>


            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLoading={isLoading && index === messages.length - 1}
                onRead={() => handleReadAloud(message.content)}
                onStop={() => handleStopAudio()}
                isTyping={isTyping}
              />
            ))}

            {isLoading && (
              <div className="flex gap-3 fade-in-up">
                <div className="w-8 h-8 rounded-full teal-gradient flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex gap-2 items-center py-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            isRecording={isRecording}
            onMicToggle={handleMicToggle}
            isLoading={isLoading}
          />
        </div>
      </main>

      <footer className="border-t border-white/20 backdrop-blur-sm bg-white/40 py-4 text-center">
        <p className="text-xs sm:text-sm text-slate-600">© 2025 AI Ecosystem. Powered by intelligent agents.</p>
      </footer>
    </div>
  );
}
