import React from 'react';

export default function ProfileCompletionBar({ percent }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
        style={{ width: `${percent || 0}%` }}
      />
      <div className="text-xs text-gray-600 mt-1 text-right">Profile Completion: {percent || 0}%</div>
    </div>
  );
}
