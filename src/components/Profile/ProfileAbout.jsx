import React from 'react';
import ProfileCard from './ProfileCard';

export default function ProfileAbout({ about, title = 'About', icon = 'info' }) {
  return (
    <ProfileCard>
      <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
        <span className={`material-icons text-blue-500`}>{icon}</span> {title}
      </h3>
      <p className="text-gray-700 min-h-[40px]">{about || 'No about info yet.'}</p>
    </ProfileCard>
  );
}
