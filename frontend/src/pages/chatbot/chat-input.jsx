// src/components/chatbot/ChatInput.js
import React from "react";
import { Send, Mic } from "lucide-react";

export default function ChatInput({ value, onChange, onSend, isRecording, onMicToggle, isLoading }) {
  return (
    <form onSubmit={onSend} className="border-t border-white/20 p-4 sm:p-6 bg-white/30 backdrop-blur-sm">
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full bg-white border-2 border-teal-200 focus:border-teal-500 focus:outline-none text-slate-900 placeholder-slate-500 transition-all soft-shadow disabled:opacity-50"
          />
        </div>

        <button
          type="button"
          onClick={onMicToggle}
          className={`p-3 sm:p-4 rounded-full flex items-center justify-center transition-all soft-shadow hover-glow flex-shrink-0 ${
            isRecording ? "teal-gradient pulse-glow shadow-lg" : "bg-white hover:bg-teal-50 text-slate-600 border border-teal-200"
          }`}
          disabled={isLoading}
          title={isRecording ? "Stop recording" : "Start recording"}
        >
          <Mic className={`w-5 h-5 ${isRecording ? "text-white" : "text-teal-600"}`} />
        </button>

        <button
          type="submit"
          disabled={!String(value || "").trim() || isLoading}
          className="p-3 sm:p-4 rounded-full teal-gradient text-white flex items-center justify-center transition-all soft-shadow hover:shadow-lg hover:shadow-teal-400/50 disabled:opacity-50 flex-shrink-0"
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
