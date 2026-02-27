import React from 'react';

const FeaturePage = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default FeaturePage;
