import React, { useState } from 'react';
import ToggleSwitch from './ToggleSwitch';
import { vehicleTypes, usageScenarios, advancedFeatures } from '../data/aiVehicles';

const PreferencePanel = ({ preferences, setPreferences, onFindMatch, isLoading = false }) => {
  const [budgetRange, setBudgetRange] = useState({ min: 10000000, max: 10000000 });
  const [selectedUsage, setSelectedUsage] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);
  const [features, setFeatures] = useState({
    safety: false,
    eco: false,
    leather: false,
    awd: false
  });

  const handleFeatureToggle = (featureId) => {
    setFeatures(prev => ({
      ...prev,
      [featureId]: !prev[featureId]
    }));
  };

  const handleFindMatch = () => {
    // Compile all preferences
    const compiledPreferences = {
      budget: budgetRange,
      usage: selectedUsage,
      vehicleType: selectedVehicleType,
      features: Object.keys(features).filter(key => features[key])
    };
    
    // Pass preferences to parent component which will handle the AI call
    onFindMatch(compiledPreferences);
  };

  const formatCurrency = (value) => {
    return `Rs. ${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Vehicle Preferences</h2>
      
      {/* Budget Range Slider */}
      <div className="mb-8">
        <label className="block text-lg font-semibold text-gray-700 mb-4">
          Budget Range
        </label>
        <div className="space-y-4">
          <input
            type="range"
            min="10000000"
            max="100000000"
            step="500000"
            value={budgetRange.max}
            onChange={(e) => setBudgetRange({ ...budgetRange, max: parseInt(e.target.value) })}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 rounded-xl">
            <span className="text-sm font-medium text-gray-600">Min:</span>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(budgetRange.min)}</span>
            <span className="text-sm font-medium text-gray-600">Max:</span>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(budgetRange.max)}</span>
          </div>
        </div>
      </div>

      {/* Usage Scenarios */}
      <div className="mb-8">
        <label className="block text-lg font-semibold text-gray-700 mb-4">
          Primary Usage
        </label>
        <div className="grid grid-cols-1 gap-3">
          {usageScenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedUsage(scenario.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-md ${
                selectedUsage === scenario.id
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{scenario.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{scenario.title}</h3>
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Type Selector */}
      <div className="mb-8">
        <label className="block text-lg font-semibold text-gray-700 mb-4">
          Vehicle Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          {vehicleTypes.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => setSelectedVehicleType(vehicle.id)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${
                selectedVehicleType === vehicle.id
                  ? 'border-blue-600 ring-2 ring-blue-300'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full h-24 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <h3 className="text-white font-semibold text-sm">{vehicle.name}</h3>
                  <p className="text-gray-200 text-xs">{vehicle.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Features */}
      <div className="mb-8">
        <label className="block text-lg font-semibold text-gray-700 mb-4">
          Advanced Features
        </label>
        <div className="border-t border-gray-200 pt-4">
          {advancedFeatures.map((feature) => (
            <ToggleSwitch
              key={feature.id}
              enabled={features[feature.id]}
              onChange={() => handleFeatureToggle(feature.id)}
              label={feature.label}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>

      {/* Find Match Button */}
      <button
        onClick={handleFindMatch}
        disabled={isLoading}
        className={`w-full text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5'
        }`}
      >
        {isLoading ? 'PLEASE WAIT...' : 'FIND MY IDEAL MATCH'}
      </button>
    </div>
  );
};

export default PreferencePanel;
