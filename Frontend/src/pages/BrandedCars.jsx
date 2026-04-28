import React, { useState, useEffect } from 'react';
import CarCard from '../components/CarCard';
import BrowseBanner from '../components/BrowseBanner';
import { API_CONFIG } from '../config/apiConfig';

const BrandedCars = () => {
  const [brandedCars, setBrandedCars] = useState([]);
  const [filterBrand, setFilterBrand] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBrandedCars();
  }, []);

  const fetchBrandedCars = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/vehicles?category=branded`);
      const data = await response.json();
      if (data.success) {
        setBrandedCars(data.data);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load branded cars');
      setLoading(false);
    }
  };

  const uniqueBrands = [...new Set(brandedCars.map(car => car.brand))];

  const filteredCars = brandedCars.filter(car => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      `${car.brand} ${car.model} ${car.name || ''}`.toLowerCase().includes(search);
    const matchesBrand = !filterBrand || car.brand === filterBrand;
    let matchesPrice = true;
    
    if (filterPrice === 'under-40k') matchesPrice = car.price < 4000000;
    else if (filterPrice === '40k-60k') matchesPrice = car.price >= 4000000 && car.price <= 6000000;
    else if (filterPrice === 'over-60k') matchesPrice = car.price > 6000000;
    
    return matchesSearch && matchesBrand && matchesPrice;
  });

  return (
    <div className="page py-8">
      <BrowseBanner />
      
      <div className="container-shell">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Branded Cars</h1>
            <p className="text-gray-600 mt-1">Browse certified inventory and filter by brand and price.</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="panel-solid mb-8">
          <div className="panel-header">
            <p className="font-semibold text-gray-900">Filter Results</p>
            <p className="text-sm text-gray-600">Search and narrow down the inventory.</p>
          </div>
          <div className="panel-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="label">Search Cars</label>
              <input
                type="text"
                placeholder="Search by brand, model, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Filter by Brand</label>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="select"
              >
                <option value="">All Brands</option>
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="label">Filter by Price Range</label>
              <select
                value={filterPrice}
                onChange={(e) => setFilterPrice(e.target.value)}
                className="select"
              >
                <option value="">All Prices</option>
                <option value="under-40k">Under Rs. 4,000,000</option>
                <option value="40k-60k">Rs. 4,000,000 - Rs. 6,000,000</option>
                <option value="over-60k">Over Rs. 6,000,000</option>
              </select>
            </div>
          </div>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-xl text-red-500">{error}</p>
          </div>
        )}

        {/* Car Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.length > 0 ? (
              filteredCars.map((car, index) => (
                <CarCard key={car._id || index} car={car} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-gray-500">No cars match your filters. Try adjusting your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandedCars;