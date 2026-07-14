import React, { useRef } from "react";
import { Upload } from "lucide-react";

export function ImageUploadZone({ onUpload }) {
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      onUpload(files[0]);
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) onUpload(files[0]);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="mb-8 p-8 border-2 border-dashed border-cyan-300 rounded-3xl cursor-pointer transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-50/50 bg-gradient-to-br from-cyan-50/50 to-transparent group"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <div className="text-center">
          <p className="text-gray-700 font-semibold">
            Click to upload or drop an image here
          </p>
          <p className="text-gray-500 text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>
    </div>
  );
}
