import React from 'react';
import ProfileCard from './ProfileCard';

export default function ProfileSkills({ skills, title = 'Skills', icon = 'star' }) {
  return (
    <ProfileCard>
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className={`material-icons text-yellow-500`}>{icon}</span> {title}
      </h3>
      <div className="flex flex-wrap gap-3">
        {skills && skills.length > 0 ? (
          skills.map((skill, idx) => (
            <span key={idx} className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium shadow hover:bg-blue-200 transition-colors duration-200">
              {skill}
            </span>
          ))
        ) : (
          <span className="text-gray-500">No skills added yet.</span>
        )}
      </div>
    </ProfileCard>
  );
}
