import React from 'react';
import ProfileCard from './ProfileCard';

export default function ProfileContact({ contactInfo }) {
  return (
    <ProfileCard>
      <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
        <span className="material-icons text-green-500">contact_mail</span> Contact Information
      </h3>
      <div className="space-y-1">
        <div className="text-gray-700"><span className="font-medium">Email:</span> {contactInfo?.email || '—'}</div>
        <div className="text-gray-700"><span className="font-medium">Phone:</span> {contactInfo?.phone || '—'}</div>
        <div className="text-gray-700"><span className="font-medium">Address:</span> {contactInfo?.address || '—'}</div>
      </div>
    </ProfileCard>
  );
}
