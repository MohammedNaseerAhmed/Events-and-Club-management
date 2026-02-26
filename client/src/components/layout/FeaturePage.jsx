import React from 'react';

const FeaturePage = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white/90 backdrop-blur-md border border-blue-100 rounded-2xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="mt-2 text-gray-600">{subtitle}</p>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default FeaturePage;
