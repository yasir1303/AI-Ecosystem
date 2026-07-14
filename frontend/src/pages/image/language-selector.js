import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

import { languages } from "../../App"; // full list from your App.js

export function LanguageSelector({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const LANGUAGES = Object.entries(languages).map(([name, code]) => ({
    name,
    code,
  }));

  const filtered = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-cyan-300 transition-colors text-gray-700 font-medium"
      >
        <span>
  {LANGUAGES.find(l => l.code === value)?.name || value}
</span>

        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50">
          <input
            type="text"
            placeholder="Search languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border-b border-gray-100 rounded-t-2xl focus:outline-none text-sm text-gray-700"
          />

          <div className="max-h-64 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    onChange(l.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-cyan-50 transition-colors ${
                    l.name === value
                      ? "bg-cyan-100 text-cyan-700 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {l.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-sm">
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
