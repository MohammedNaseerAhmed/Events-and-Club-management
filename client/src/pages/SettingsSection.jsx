import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FeaturePage from '../components/layout/FeaturePage';

const labels = {
  'change-password': 'Change Password',
  'personal-details': 'Personal Details',
  'privacy-settings': 'Privacy Settings',
  notifications: 'Notification Settings',
  organizations: 'Organizations',
  'delete-account': 'Delete Account',
};

const SettingsSection = () => {
  const { section } = useParams();
  const { user } = useAuth();
  const label = labels[section] || 'Settings';
  const adminOnlySection = section === 'organizations';
  const isAdmin = user?.role === 'admin';

  return (
    <FeaturePage
      title={label}
      subtitle="Account and platform-level settings."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {adminOnlySection && !isAdmin ? (
          <p className="text-sm text-red-600">
            Only admins can manage organizations and create clubs.
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Section is ready. You can attach form/actions for this settings module.
          </p>
        )}
      </div>
    </FeaturePage>
  );
};

export default SettingsSection;
