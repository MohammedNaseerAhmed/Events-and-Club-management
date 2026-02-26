import React from 'react';
import { useParams } from 'react-router-dom';
import FeaturePage from '../components/layout/FeaturePage';

const UserProfile = () => {
  const { username } = useParams();

  return (
    <FeaturePage
      title={`@${username}`}
      subtitle="Public profile page with clubs, events, and activity."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-600">
          Profile route is active. Connect this to user profile APIs as needed.
        </p>
      </div>
    </FeaturePage>
  );
};

export default UserProfile;
