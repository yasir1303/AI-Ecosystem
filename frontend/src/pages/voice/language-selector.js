"use client";

import { languages } from "../../App";

export default function LanguageSelector({ value, onChange }) {
  return (
    <select
      className="voice-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {Object.entries(languages).map(([name, code]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
}
