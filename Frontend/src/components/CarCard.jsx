import React from 'react';
import { Link } from 'react-router-dom';

const CarCard = ({ car }) => {
  const carId = car._id || car.id;

  return (
    <div className="card group">
      <div className="relative h-48 overflow-hidden bg-gray-50">
        <img
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-emerald-50/95 backdrop-blur text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-semibold border border-emerald-200">
          {car.condition}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-extrabold text-gray-900 mb-1">{car.brand} {car.model}</h3>
        <p className="text-sm text-gray-600 mb-3">{car.year}</p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-extrabold text-primary-700">Rs. {car.price.toLocaleString()}</span>
          <span className="text-gray-500 text-sm font-semibold">{car.fuelType}</span>
        </div>
        
        {car.mileage && (
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span className="font-medium">Mileage: {car.mileage}</span>
            <span className="font-medium">{car.transmission || '—'}</span>
          </div>
        )}
        
        <div className="flex">
          <Link
            to={carId ? `/car-details/${carId}` : '#'}
            state={{ car }}
            className="w-full btn-ghost text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;