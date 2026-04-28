import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AlternativeCard = ({ vehicle, onViewDetails }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80';

  const handleViewDetails = () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          redirectMessage: 'Please login to view complete vehicle details',
          redirectTo: '/ai-suggestion'
        }
      });
      return;
    }
    onViewDetails(vehicle);
  };

  return (
    <div className="min-w-[280px] bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="relative">
        <img
          src={vehicle.image || FALLBACK_IMAGE}
          alt={vehicle.name}
          className="w-full h-40 object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {vehicle.tag}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{vehicle.name}</h3>
        <p className="text-sm text-gray-500 mb-2">
          {vehicle.brand} {vehicle.model} • {vehicle.year}
        </p>
        
        <div className="mb-3">
          <span className="text-blue-600 font-bold">{vehicle.priceFormatted}</span>
        </div>
        
        <div className="flex gap-2 text-xs text-gray-600 mb-3">
          <span className="bg-gray-100 px-2 py-1 rounded">{vehicle.fuelType}</span>
          <span className="bg-gray-100 px-2 py-1 rounded">{vehicle.transmission}</span>
        </div>
        
        <button
          onClick={handleViewDetails}
          className={`w-full py-2 rounded-lg font-medium transition-all duration-300 ${
            isAuthenticated
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isAuthenticated ? 'View Details' : 'Login to View'}
        </button>
      </div>
    </div>
  );
};

export default AlternativeCard;
