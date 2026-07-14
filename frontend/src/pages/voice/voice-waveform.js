"use client";

export default function VoiceWaveform({ isActive }) {
  const bars = Array.from({ length: 20 });

  return (
    <div className="waveform">
      {bars.map((_, i) => (
        <div
          key={i}
          className={`bar ${isActive ? "active" : ""}`}
          style={{ animationDelay: `${i * 0.05}s` }}
        />
      ))}
    </div>
  );
}
