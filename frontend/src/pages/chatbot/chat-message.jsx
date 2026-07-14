// src/components/chatbot/ChatMessage.js
import React from "react";
import { Bot, User, Volume2, Square } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function formatBotMessage(text) {
  const regex = /(\d+\.\s.+?)(?=\d+\.|$)/gs;
  const matches = text.match(regex);

  if (matches && matches.length >= 2) {
    return matches.map((point, index) => (
      <div key={index} className="mb-2 leading-relaxed">
        {point.trim()}
      </div>
    ));
  }

  return <span>{text}</span>;
}

export default function ChatMessage({ message, isTyping, onRead, onStop }) {
  const isBotMessage = message.type === "bot";

  return (
    <div className={`flex gap-3 animate-fade-in-up ${isBotMessage ? "justify-start" : "justify-end"}`}>
      {isBotMessage && (
        <div className="w-8 h-8 rounded-full teal-gradient flex items-center justify-center flex-shrink-0 soft-shadow hover-glow">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`flex flex-col ${isBotMessage ? "items-start" : "items-end"} gap-2`}>
        <div
          className={`max-w-xs sm:max-w-md px-4 py-3 rounded-2xl soft-shadow transition-all ${
            isBotMessage
              ? "teal-gradient text-white rounded-bl-none"
              : "bg-slate-800 text-white rounded-br-none"
          }`}
        >
          <div className="text-sm leading-relaxed">
  {isBotMessage ? (
    isTyping ? (
      <span>{message.content}</span>
    ) : (
      formatBotMessage(message.content)
    )
  ) : (
    message.content
  )}
</div>

        </div>

        <div className="flex gap-2 items-center px-2">
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>

          {isBotMessage && (
            <div className="flex gap-1.5">
              <button
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium"
                onClick={() => onRead(message.content)}
              >
                <Volume2 className="w-3 h-3" /> Read
              </button>

              <button
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium"
                onClick={onStop}
              >
                <Square className="w-3 h-3" /> Stop
              </button>
            </div>
          )}
        </div>
      </div>

      {!isBotMessage && (
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 soft-shadow hover-glow">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
