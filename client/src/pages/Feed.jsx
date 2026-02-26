import React from 'react';
import FeaturePage from '../components/layout/FeaturePage';

const Feed = () => {
  return (
    <FeaturePage
      title="Feed"
      subtitle="Campus updates from clubs, organizations, and upcoming activities."
    >
      <div className="grid gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800">Announcements</h3>
          <p className="text-sm text-gray-600 mt-2">
            Use existing notifications and events to build your feed stream.
          </p>
        </div>
      </div>
    </FeaturePage>
  );
};

export default Feed;
