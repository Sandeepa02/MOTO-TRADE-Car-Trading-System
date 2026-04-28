import React from 'react';

const RecommendationCard = ({ vehicle, isLoading, onViewDetails }) => {
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80';

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-lg mt-6"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="relative">
        <img
          src={vehicle.image || FALLBACK_IMAGE}
          alt={vehicle.name}
          className="w-full h-72 object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
          ✨ Premium Match
        </div>
      </div>
      
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.name}</h2>
        <p className="text-gray-600 mb-4">
          {vehicle.brand} {vehicle.model} • {vehicle.year}
        </p>
        
        <div className="mb-6">
          <span className="text-3xl font-bold text-blue-600">{vehicle.priceFormatted}</span>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Key Features</h3>
          <ul className="space-y-2">
            {vehicle.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex gap-3 mb-6">
          <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
            ⚡ {vehicle.fuelType}
          </span>
          <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
            ⚙️ {vehicle.transmission}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-6 italic border-l-4 border-blue-500 pl-4">
          "{vehicle.description}"
        </p>
        
        <button
          onClick={() => onViewDetails(vehicle)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          View Complete Details
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
