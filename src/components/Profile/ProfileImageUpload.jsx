import React, { useRef } from 'react';

export default function ProfileImageUpload({ label, onChange, previewUrl, loading }) {
  const inputRef = useRef();
  return (
    <div className="flex flex-col items-center gap-4">
      {previewUrl && (
        <img src={previewUrl} alt={label} className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow" />
      )}
      <button
        type="button"
        className="bg-blue-500 text-white px-5 py-2 rounded shadow hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-200"
        onClick={() => inputRef.current.click()}
        disabled={loading}
      >
        {loading ? 'Uploading...' : `Upload ${label}`}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
        disabled={loading}
      />
    </div>
  );
}
