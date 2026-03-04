import React from 'react';
import ProfileCard from './ProfileCard';

const icons = {
  linkedin: 'linkedin',
  github: 'code',
  facebook: 'facebook',
  portfolio: 'public',
};

export default function ProfileSocialLinks({ socialLinks }) {
  return (
    <ProfileCard>
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="material-icons text-blue-500">share</span> Social Links
      </h3>
      <div className="flex flex-wrap gap-4">
        {Object.entries(socialLinks || {}).map(([key, value]) =>
          value ? (
            <a
              key={key}
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
            >
              <span className="material-icons text-lg">{icons[key] || 'link'}</span>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </a>
          ) : null
        )}
        {(!socialLinks || Object.values(socialLinks).every(v => !v)) && (
          <span className="text-gray-500">No social links added yet.</span>
        )}
      </div>
    </ProfileCard>
  );
}
