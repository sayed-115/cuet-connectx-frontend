import React from 'react';
import Card from '../Card';

export default function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-5xl mx-auto mt-8">
      <div className="h-56 md:h-64 bg-gradient-to-br from-blue-300 to-purple-300 rounded-b-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-[-60px]">
        <div className="md:col-span-1 space-y-4">
          <Card className="h-40 bg-gray-200" />
          <Card className="h-32 bg-gray-200" />
        </div>
        <div className="md:col-span-2 space-y-4">
          <Card className="h-32 bg-gray-200" />
          <Card className="h-32 bg-gray-200" />
          <Card className="h-32 bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
