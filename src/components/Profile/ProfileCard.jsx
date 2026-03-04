import React from 'react';

export default function ProfileCard({ children, className = '' }) {
  return (
    <div className={`bg-white/70 backdrop-blur rounded-2xl shadow-2xl p-6 mb-6 ${className}`}>
      {children}
    </div>
  );
}
