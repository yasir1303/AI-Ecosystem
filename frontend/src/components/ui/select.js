// src/components/ui/select.js
import React, { useState } from "react";

/*
  Lightweight custom Select component compatible with v0.dev structure:
  
  <Select value={} onValueChange={}>
    <SelectTrigger>...</SelectTrigger>
    <SelectContent>
      <SelectItem value="...">Label</SelectItem>
    </SelectContent>
  </Select>

  This avoids installing Radix/ShadCN and works perfectly in CRA projects.
*/

export function Select({ children, value, onValueChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          value,
          onValueChange,
          open,
          setOpen,
        })
      )}
    </div>
  );
}

export function SelectTrigger({ children, className = "", value, setOpen, open }) {
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`px-3 py-1.5 bg-white border rounded-md text-sm flex items-center justify-between w-full ${className}`}
    >
      <span>{value || "Select"}</span>
      <span className="ml-2 text-xs">▾</span>
    </button>
  );
}

export function SelectContent({ children, open, setOpen, onValueChange }) {
  if (!open) return null;

  return (
    <div className="absolute mt-1 bg-white border rounded shadow-md w-full z-50 overflow-hidden">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          onValueChange: (v) => {
            onValueChange(v);
            setOpen(false);
          },
        })
      )}
    </div>
  );
}

export function SelectItem({ children, value, onValueChange }) {
  return (
    <div
      onClick={() => onValueChange(value)}
      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
    >
      {children}
    </div>
  );
}

export function SelectValue() {
  // v0 component placeholder; not needed in shim.
  return null;
}

export default Select;
