import React from 'react';
import FeaturePage from '../components/layout/FeaturePage';

const Courses = () => {
  return (
    <FeaturePage
      title="Courses"
      subtitle="Learning tracks and training resources for the student community."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-600">
          Route and layout are ready for future course modules.
        </p>
      </div>
    </FeaturePage>
  );
};

export default Courses;
