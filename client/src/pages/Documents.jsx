import React from 'react';
import FeaturePage from '../components/layout/FeaturePage';

const Documents = () => {
  return (
    <FeaturePage
      title="Documents"
      subtitle="Centralized files for admins, club heads, and members."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-600">
          This page is scaffolded for document upload and sharing workflows.
        </p>
      </div>
    </FeaturePage>
  );
};

export default Documents;
