import React from 'react';
import FeaturePage from '../components/layout/FeaturePage';

const Chats = () => {
  return (
    <FeaturePage
      title="Chats"
      subtitle="Direct and group conversations for clubs, events, and teams."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-600">
          Chat UI route is ready. You can connect it to real-time messaging later.
        </p>
      </div>
    </FeaturePage>
  );
};

export default Chats;
