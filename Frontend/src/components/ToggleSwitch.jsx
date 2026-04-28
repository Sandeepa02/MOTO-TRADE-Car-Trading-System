import React from 'react';

const ToggleSwitch = ({ enabled, onChange, label, icon }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center space-x-3">
        {icon && <span className="text-xl">{icon}</span>}
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
