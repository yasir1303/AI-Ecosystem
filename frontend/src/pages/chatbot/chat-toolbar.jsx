// src/components/chatbot/ChatToolbar.js
import React from "react";
import { Download, FileText, Trash2 } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";


export default function ChatToolbar({
  responseStyle,
  onResponseStyleChange,
  onExportTxt,
  onExportPdf,
  onClearChat,
}) {
  return (
    <div className="border-b border-white/20 p-3 sm:p-4 bg-gradient-to-r from-white/60 to-teal-50/50 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs sm:text-sm font-medium text-slate-600 whitespace-nowrap">Response Style:</span>
        <Select value={responseStyle} onValueChange={(v) => onResponseStyleChange(v)}>
          <SelectTrigger className="w-24 sm:w-32 h-8 text-xs rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">Short</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-1.5 items-center">
        <button
          onClick={onExportTxt}
          className="p-2 rounded-lg hover:bg-white transition-colors soft-shadow text-slate-600 hover:text-teal-600"
          title="Export as TXT"
        >
          <FileText className="w-4 h-4" />
        </button>
        <button
          onClick={onExportPdf}
          className="p-2 rounded-lg hover:bg-white transition-colors soft-shadow text-slate-600 hover:text-teal-600"
          title="Export as PDF"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={onClearChat}
          className="p-2 rounded-lg hover:bg-red-50 transition-colors soft-shadow text-slate-600 hover:text-red-600"
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
