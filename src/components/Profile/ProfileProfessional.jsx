import React from 'react';
import ProfileCard from './ProfileCard';

export default function ProfileProfessional({ professionalInfo, title = 'Professional Information', icon = 'work' }) {
  return (
    <ProfileCard>
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className={`material-icons text-purple-500`}>{icon}</span> {title}
      </h3>
      <div className="space-y-2">
        <div className="text-gray-800"><span className="font-medium">Position:</span> {professionalInfo?.currentPosition || '—'}</div>
        <div className="text-gray-800"><span className="font-medium">Company:</span> {professionalInfo?.company || '—'}</div>
        <div className="text-gray-800"><span className="font-medium">Location:</span> {professionalInfo?.location || '—'}</div>
      </div>
    </ProfileCard>
  );
}
