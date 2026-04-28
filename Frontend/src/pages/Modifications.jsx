import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import BrowseBanner from '../components/BrowseBanner';
import { API_CONFIG } from '../config/apiConfig';

const Modifications = () => {
  const [modificationItems, setModificationItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModifications();
  }, []);

  const fetchModifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/modifications`);
      const data = await response.json();
      if (data.success) {
        setModificationItems(data.data);
        setError(null);
      } else {
        setError('Failed to load modifications');
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Cannot connect to server. Please ensure backend is running.');
      setLoading(false);
    }
  };
  
  const uniqueCategories = [...new Set(modificationItems.map(item => item.category))];
  
  const filteredItems = modificationItems.filter(item => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      `${item.name || ''} ${item.category || ''} ${item.brand || ''} ${item.compatibleVehicle || ''}`
        .toLowerCase()
        .includes(search);

    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page py-8">
      <BrowseBanner />
      
      <div className="container-shell">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Modification Items</h1>
          <p className="text-gray-600 mt-1">Search and filter modification items.</p>
        </div>
        
        {/* Filter Options */}
        <div className="panel-solid mb-8">
          <div className="panel-header">
            <p className="font-semibold text-gray-900">Filter Results</p>
            <p className="text-sm text-gray-600">Search by keyword and category.</p>
          </div>
          <div className="panel-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Search Modifications</label>
              <input
                type="text"
                placeholder="Search by name, category, brand, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Filter by Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="select"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
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
              onClick={fetchModifications}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Modification Items Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ProductCard key={item._id || item.id} product={item} cartKind="modification" />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-gray-500">No modification items match your filter. Try adjusting your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modifications;