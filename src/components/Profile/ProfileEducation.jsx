import React from 'react';
import ProfileCard from './ProfileCard';

export default function ProfileEducation({ education, onAdd, onEdit, onDelete }) {
  return (
    <ProfileCard>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <span className="material-icons text-pink-500">school</span> Education
        </h3>
        <button onClick={onAdd} className="bg-blue-500 text-white rounded px-3 py-1 text-xs font-semibold shadow hover:bg-blue-600">Add</button>
      </div>
      <div className="space-y-3">
        {education && education.length > 0 ? (
          education.map((edu, idx) => (
            <div key={edu._id || idx} className="bg-white/80 rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between shadow">
              <div>
                <div className="font-medium text-blue-700">{edu.degree}</div>
                <div className="text-gray-600 text-sm">{edu.institution} &bull; {edu.year}</div>
                <div className="text-gray-500 text-xs">{edu.major} {edu.focus && `- ${edu.focus}`}</div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button onClick={() => onEdit(edu)} className="text-yellow-600 hover:underline">Edit</button>
                <button onClick={() => onDelete(edu._id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <span className="text-gray-400">No education added yet.</span>
        )}
      </div>
    </ProfileCard>
  );
}
