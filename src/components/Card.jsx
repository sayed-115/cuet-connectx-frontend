import React from 'react';

export default function Card({ children, className = '', onClick, hoverEffect = false }) {
  return (
    <div
      className={`bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 ${hoverEffect ? 'hover:shadow-2xl transition-shadow duration-200' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
