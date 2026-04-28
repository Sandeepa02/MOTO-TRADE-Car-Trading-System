import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/apiConfig';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyListings = async () => {
      if (!user?.email) {
        setMyListings([]);
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/second-hand-cars/mine`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await response.json();
        if (data.success) {
          setMyListings(data.data || []);
        } else {
          setMyListings([]);
        }
      } catch (error) {
        setMyListings([]);
      } finally {
        setLoading(false);
      }
    };

    loadMyListings();
  }, [user?.email]);

  const totalListings = myListings.length;
  const totalValue = myListings.reduce((sum, car) => sum + (Number(car.price) || 0), 0);
  const avgPrice = totalListings > 0 ? Math.round(totalValue / totalListings) : 0;

  return (
    <div className="page py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="panel-solid">
          <div className="panel-header flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Seller Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your inventory and track performance.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/seller-dashboard/add-listing')}
                className="btn-portal"
              >
                Add New Listing
              </button>
              <button onClick={() => navigate('/my-chats')} className="btn-portal">
                My Chats
              </button>
              <button
                onClick={() => navigate('/second-hand-cars')}
                className="btn-ghost"
              >
                View Marketplace
              </button>
            </div>
          </div>
          <div className="panel-body">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="kpi-card bg-gradient-to-b from-surface-50 to-white">
            <p className="text-sm text-gray-600">Total Listings</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalListings}</p>
          </div>
          <div className="kpi-card bg-gradient-to-b from-surface-50 to-white">
            <p className="text-sm text-gray-600">Total Listing Value</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">Rs. {totalValue.toLocaleString()}</p>
          </div>
          <div className="kpi-card bg-gradient-to-b from-surface-50 to-white">
            <p className="text-sm text-gray-600">Average Price</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">Rs. {avgPrice.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Your listings</h2>
          <div className="mt-3 space-y-3">
            {myListings.length === 0 ? (
              <div className="panel-solid p-4">
                <p className="text-gray-600">
                  {loading
                    ? 'Loading your listings...'
                    : 'No listings yet. Click Add New Listing to create your first car listing.'}
                </p>
              </div>
            ) : (
              myListings.map((car) => (
                <div
                  key={car._id}
                  className="panel-solid p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {car.brand} {car.model} ({car.year})
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Rs. {Number(car.price).toLocaleString()} — {car.mileage}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/seller-dashboard/edit-listing/${car._id}`)}
                    className="btn-ghost shrink-0 self-start sm:self-center"
                  >
                    Edit
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
