import React, { useState, useEffect } from 'react';
import CarCard from '../components/CarCard';
import BrowseBanner from '../components/BrowseBanner';
import { API_CONFIG } from '../config/apiConfig';

const SecondHandCars = () => {
  const [secondHandCars, setSecondHandCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price-low');
  const [mileageFilter, setMileageFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSecondHandCars();
  }, []);

  const fetchSecondHandCars = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/second-hand-cars`);
      const data = await response.json();
      if (data.success) {
        setSecondHandCars(data.data || []);
        setError(null);
      } else {
        setError('Failed to load second-hand cars');
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Cannot connect to server. Please ensure backend is running.');
      setLoading(false);
    }
  };
  
  // Define mileage ranges as requested
  const mileageRanges = [
    { value: 'all', label: 'All Mileages' },
    { value: '0-30000', label: 'Below 30,000 km', min: 0, max: 30000 },
    { value: '30000-60000', label: '30,000 - 60,000 km', min: 30000, max: 60000 },
    { value: '60000-90000', label: '60,000 - 90,000 km', min: 60000, max: 90000 },
    { value: '90000-120000', label: '90,000 - 120,000 km', min: 90000, max: 120000 },
    { value: '120000-150000', label: '120,000 - 150,000 km', min: 120000, max: 150000 },
    { value: '150000-200000', label: '150,000 - 200,000 km', min: 150000, max: 200000 },
    { value: '200000+', label: 'Over 200,000 km', min: 200000, max: Infinity }
  ];

  // Define brand options from actual data
  const uniqueBrands = [...new Set(secondHandCars.map(car => car.brand))];
  const brandOptions = [
    { value: 'all', label: 'All Brands' },
    ...uniqueBrands.map(brand => ({ value: brand, label: brand }))
  ];

  // Filter cars by mileage and brand
  const filteredCars = secondHandCars.filter(car => {
    const search = searchTerm.trim().toLowerCase();
    const mileageRaw = car.mileage ?? '';
    const mileageNumeric =
      typeof mileageRaw === 'number'
        ? mileageRaw
        : parseInt(String(mileageRaw).replace(/[^\d]/g, ''), 10);
    const matchesSearch =
      !search ||
      `${car.brand || ''} ${car.model || ''} ${car.vehicleNumber || ''} ${car.vehicleColor || ''}`
        .toLowerCase()
        .includes(search);

    // Mileage filter
    if (mileageFilter !== 'all') {
      const range = mileageRanges.find(range => range.value === mileageFilter);
      if (range) {
        if (Number.isNaN(mileageNumeric) || mileageNumeric < range.min || mileageNumeric > range.max) {
          return false;
        }
      }
    }
    
    // Brand filter
    if (brandFilter !== 'all' && car.brand !== brandFilter) {
      return false;
    }
    
    return matchesSearch;
  });

  // Sort the filtered cars
  const sortedCars = [...filteredCars].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'year-new') return b.year - a.year;
    if (sortBy === 'year-old') return a.year - b.year;
    return 0;
  });

  return (
    <div className="page py-8">
      <BrowseBanner />
      
      <div className="container-shell">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Second-Hand Cars</h1>
          <p className="text-gray-600 mt-1">Search by vehicle details and filter by brand, mileage, and sort order.</p>
        </div>
        
        {/* Filter Options */}
        <div className="panel-solid mb-8">
          <div className="panel-header">
            <p className="font-semibold text-gray-900">Filter Results</p>
            <p className="text-sm text-gray-600">Find the right second-hand car quickly.</p>
          </div>
          <div className="panel-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-4">
              <label className="label">Search Second-Hand Cars</label>
              <input
                type="text"
                placeholder="Search by brand, model, vehicle number, or color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Used Mileage</label>
              <select
                value={mileageFilter}
                onChange={(e) => setMileageFilter(e.target.value)}
                className="select"
              >
                {mileageRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="label">Filter by Brand</label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="select"
              >
                {brandOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="label">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select"
              >
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="year-new">Year: Newest First</option>
                <option value="year-old">Year: Oldest First</option>
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Connection Issue</p>
            <p>{error}</p>
            <button 
              onClick={fetchSecondHandCars}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Results count and Car Grid */}
        {!loading && !error && (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {sortedCars.length} of {secondHandCars.length} cars
                {(() => {
                  const mileageRange = mileageRanges.find(r => r.value === mileageFilter);
                  const brandOption = brandOptions.find(b => b.value === brandFilter);
                  
                  return (
                    <>
                      {mileageFilter !== 'all' && mileageRange && (
                        <span> (filtered by {mileageRange.label})</span>
                      )}
                      {brandFilter !== 'all' && brandOption && (
                        <span> (brand: {brandOption.label})</span>
                      )}
                    </>
                  );
                })()}
              </p>
            </div>
            
            {sortedCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedCars.map((car) => (
                  <CarCard key={car._id || car.id} car={car} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-xl">No cars found matching your criteria</p>
                <button 
                  onClick={() => {
                    setMileageFilter('all');
                    setBrandFilter('all');
                    setSortBy('price-low');
                  }}
                  className="mt-4 btn-portal"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SecondHandCars;