"use client";

import { Mic, Square } from "lucide-react";

export default function MicButton({ isRecording, isProcessing, onStart, onStop }) {
  return (
    <button
      className={`mic-btn ${isRecording ? "recording" : ""}`}
      disabled={isProcessing}
      onClick={isRecording ? onStop : onStart}
    >
      {isRecording ? <Square /> : <Mic />}
    </button>
  );
}
