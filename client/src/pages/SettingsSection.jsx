import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FeaturePage from '../components/layout/FeaturePage';
import PersonalDetailsForm from '../components/settings/PersonalDetailsForm';
import ChangePasswordForm from '../components/settings/ChangePasswordForm';
import PrivacySettingsForm from '../components/settings/PrivacySettingsForm';
import NotificationSettingsForm from '../components/settings/NotificationSettingsForm';
import DeleteAccountForm from '../components/settings/DeleteAccountForm';

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
  const { showToast } = useToast();
  const onSuccess = useCallback((message) => showToast(message, 'success'), [showToast]);

  const label = labels[section] || 'Settings';
  const adminOnlySection = section === 'organizations';
  const isAdmin = user?.role === 'admin';

  const renderContent = () => {
    if (adminOnlySection && !isAdmin) {
      return (
        <p className="text-sm text-red-600 dark:text-red-400">
          Only admins can manage organizations and create clubs.
        </p>
      );
    }
    switch (section) {
      case 'personal-details':
        return <PersonalDetailsForm onSuccess={onSuccess} />;
      case 'change-password':
        return <ChangePasswordForm onSuccess={onSuccess} />;
      case 'privacy-settings':
        return <PrivacySettingsForm onSuccess={onSuccess} />;
      case 'notifications':
        return <NotificationSettingsForm onSuccess={onSuccess} />;
      case 'delete-account':
        return <DeleteAccountForm />;
      case 'organizations':
        return (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Organization management is available from the Admin Panel.
          </p>
        );
      default:
        return (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Select a section from the sidebar.
          </p>
        );
    }
  };

  return (
    <FeaturePage
      title={label}
      subtitle="Account and platform-level settings."
    >
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        {renderContent()}
      </div>
    </FeaturePage>
  );
};

export default SettingsSection;
