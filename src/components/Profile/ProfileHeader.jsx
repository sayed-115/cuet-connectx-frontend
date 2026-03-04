import React from 'react';

export default function ProfileHeader({ user, avatar, coverImage, onEditAvatar, onEditCover, actions }) {
  return (
    <div className="relative w-full h-56 md:h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-b-3xl shadow-lg overflow-hidden flex items-end">
      {coverImage && (
        <img src={coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-90" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="relative z-10 flex flex-col items-center w-full pb-6">
        <div className="relative">
          <img
            src={avatar}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover bg-white"
          />
          {onEditAvatar && (
            <button
              onClick={onEditAvatar}
              className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-blue-600 rounded-full p-2 shadow-lg focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-200"
              title="Change profile picture"
            >
              <span className="material-icons">photo_camera</span>
            </button>
          )}
        </div>
        <h2 className="mt-4 text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{user?.fullName}</h2>
        <p className="text-white/80 text-sm">{user?.studentId} &bull; {user?.email}</p>
        {actions && <div className="mt-4 flex gap-2">{actions}</div>}
        {onEditCover && (
          <button
            onClick={onEditCover}
            className="absolute top-4 right-4 bg-white/80 hover:bg-white text-blue-600 rounded-full p-2 shadow"
            title="Change cover image"
          >
            <span className="material-icons">photo_camera</span>
          </button>
        )}
      </div>
    </div>
  );
}
