import React from 'react';
import FeaturePage from '../components/layout/FeaturePage';

const NetworkInvitations = () => {
  return (
    <FeaturePage
      title="Network Invitations"
      subtitle="Manage incoming and outgoing collaboration requests."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-600">
          Invitation workflows can plug into your user and club membership APIs.
        </p>
      </div>
    </FeaturePage>
  );
};

export default NetworkInvitations;
