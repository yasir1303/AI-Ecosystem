"use client";

import { Trash2, Volume2 } from "lucide-react";

export default function VoiceHistoryItem({ item }) {
  return (
    <div className="history-item">
      <div className="left">
        <button
          className="play-btn"
          onClick={() => new Audio(item.audioUrl).play()}
        >
          <Volume2 />
        </button>

        <div>
          <p>{item.translatedText}</p>
          <small>
            {item.language} • {item.emotion}
          </small>
        </div>
      </div>

      <button className="delete-btn">
        <Trash2 />
      </button>
    </div>
  );
}
