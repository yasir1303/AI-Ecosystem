import React, { useState } from "react";
import { Volume2, Copy, Trash2 } from "lucide-react";

export function HistoryItem({ item }) {
  const [isDeleted, setIsDeleted] = useState(false);

  if (isDeleted) return null;

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 group">
      <div className="flex gap-4">
        <img
          src={item.imageUrl}
          alt="img"
          className="w-20 h-20 rounded-lg object-cover shadow-md"
        />

        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <p className="text-xs text-cyan-700 font-semibold uppercase">
              {item.language}
            </p>
            <p className="text-xs text-gray-500">{timeAgo(item.timestamp)}</p>
          </div>

          <p className="text-sm text-gray-700 line-clamp-2">{item.extractedText}</p>

          <p className="text-sm text-cyan-600 font-medium line-clamp-2 mt-2">
            {item.translatedText}
          </p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigator.clipboard.writeText(item.translatedText)}
              className="flex items-center gap-1 text-xs px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>

            <button
              onClick={() => alert("Will connect to speak")}
              className="flex items-center gap-1 text-xs px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100"
            >
              <Volume2 className="w-3 h-3" />
              Listen
            </button>

            <button
              onClick={() => setIsDeleted(true)}
              className="text-gray-400 hover:text-red-500 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
