import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import BrowseBanner from '../components/BrowseBanner';
import { API_CONFIG } from '../config/apiConfig';

const SpareParts = () => {
  const [spareParts, setSpareParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const fetchSpareParts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/spare-parts`);
      const data = await response.json();
      if (data.success) {
        setSpareParts(data.data);
        setError(null);
      } else {
        setError('Failed to load spare parts');
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Cannot connect to server. Please ensure backend is running.');
      setLoading(false);
    }
  };
  
  const filteredParts = spareParts.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.compatibleVehicle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page py-8">
      <BrowseBanner />
      
      <div className="container-shell">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Spare Parts</h1>
          <p className="text-gray-600 mt-1">Search parts by name and compatible vehicle.</p>
        </div>
        
        {/* Search Bar */}
        <div className="panel-solid mb-8">
          <div className="panel-header">
            <p className="font-semibold text-gray-900">Search</p>
            <p className="text-sm text-gray-600">Find the right part faster.</p>
          </div>
          <div className="panel-body">
          <div>
            <label className="label">Search Parts</label>
            <input
              type="text"
              placeholder="Search by part name or compatible vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
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
              onClick={fetchSpareParts}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Parts Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredParts.length > 0 ? (
              filteredParts.map((part) => (
                <ProductCard key={part._id || part.id} product={part} cartKind="spare-part" />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-gray-500">No parts match your search. Try different keywords.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpareParts;